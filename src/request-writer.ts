import RequestBuffer from './request-buffer';
import Protocol from './protocol';
import MillenniumDBError from './millenniumdb-error';
import buffer from 'buffer';
import { GraphAnon, GraphEdge, GraphNode, IRI, StringDatatype, StringLang } from './graph-objects';

class RequestWriter {
    private _requestBuffer: RequestBuffer;

    constructor(requestBuffer: RequestBuffer) {
        this._requestBuffer = requestBuffer;
    }

    writeRun(query: string, parameters: Record<string, any>): void {
        this._writeByte(Protocol.RequestType.QUERY);
        this._writeString(query);
        this._writeParameters(parameters);
        this._requestBuffer.seal();
    }

    writeCatalog(): void {
        this._writeByte(Protocol.RequestType.CATALOG);
        this._requestBuffer.seal();
    }

    writeCancel(workerIndex: number, cancellationToken: string): void {
        this._writeByte(Protocol.RequestType.CANCEL);
        this._writeUint32(workerIndex);
        this._writeString(cancellationToken);
        this._requestBuffer.seal();
    }

    flush(): void {
        this._requestBuffer.flush();
    }

    private _writeObject(value: any): void {
        if (value === null) {
            this._writeNull();
        } else if (typeof value === 'boolean') {
            this._writeBoolean(value);
        } else if (typeof value === 'string') {
            this._writeString(value);
        } else if (typeof value === 'bigint') {
            this._writeInt64(value);
        } else if (typeof value === 'number') {
            if (Number.isInteger(value)) {
                this._writeInt64(BigInt(value));
            } else {
                this._writeFloat(value);
            }
        } else if (value instanceof GraphAnon) {
            this._writeAnon(BigInt(value.id));
        } // MQL
        else if (value instanceof GraphNode) {
            this._writeNamedNode(value.id);
        } else if (value instanceof GraphEdge) {
            this._writeEdge(BigInt(value.id));
        } // SPARQL
        else if (value instanceof IRI) {
            this._writeIri(value.iri);
        } else if (value instanceof StringLang) {
            this._writeStringLang(value);
        } else if (value instanceof StringDatatype) {
            this._writeStringDatatype(value);
        } else {
            throw new MillenniumDBError(`RequestWriter Error: Unsupported type: ${value}`);
        }
    }

    private _writeNull() {
        this._writeByte(Protocol.DataType.NULL_);
    }

    private _writeBoolean(value: boolean) {
        this._writeByte(value ? Protocol.DataType.BOOL_TRUE : Protocol.DataType.BOOL_FALSE);
    }

    private _writeByte(byte: number) {
        this._requestBuffer.write(new Uint8Array([byte]));
    }

    private _writeUint32(value: number): void {
        this._writeByte(Protocol.DataType.UINT32);
        const bytes = buffer.Buffer.alloc(4);
        bytes.writeUInt32BE(value);
        this._requestBuffer.write(bytes as Uint8Array);
    }

    private _writeInt64(value: bigint): void {
        this._writeByte(Protocol.DataType.INT64);
        const bytes = buffer.Buffer.alloc(8);
        bytes.writeBigInt64BE(value);
        this._requestBuffer.write(bytes as Uint8Array);
    }

    private _writeFloat(value: number): void {
        const bytes = buffer.Buffer.alloc(5);
        bytes.writeFloatBE(value);
        this._writeByte(Protocol.DataType.FLOAT);
        this._requestBuffer.write(bytes as Uint8Array);
    }

    private _writeNamedNode(value: string): void {
        const enc = this._encodeTypedString(value, Protocol.DataType.NAMED_NODE);
        this._requestBuffer.write(enc);
    }

    private _writeEdge(value: bigint): void {
        this._writeByte(Protocol.DataType.EDGE);
        const bytes = buffer.Buffer.alloc(8);
        bytes.writeBigUint64BE(value);
        this._requestBuffer.write(bytes as Uint8Array);
    }

    private _writeAnon(value: bigint): void {
        this._writeByte(Protocol.DataType.ANON);
        const bytes = buffer.Buffer.alloc(8);
        bytes.writeBigUint64BE(value);
        this._requestBuffer.write(bytes as Uint8Array);
    }

    private _writeString(value: string): void {
        const enc = this._encodeTypedString(value, Protocol.DataType.STRING);
        this._requestBuffer.write(enc);
    }

    private _writeIri(value: string): void {
        const enc = this._encodeTypedString(value, Protocol.DataType.IRI);
        this._requestBuffer.write(enc);
    }

    private _writeStringLang(value: StringLang): void {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(value.lang);

        const encStr = this._encodeTypedString(value.str, Protocol.DataType.STRING_LANG);
        const encLang = this._encodeBytes(encoded);
        this._requestBuffer.write(encStr);
        this._requestBuffer.write(encLang);
    }

    private _writeStringDatatype(value: StringDatatype): void {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(value.datatype.iri);

        const encStr = this._encodeTypedString(value.str, Protocol.DataType.STRING_LANG);
        const encDatatype = this._encodeBytes(encoded);
        this._requestBuffer.write(encStr);
        this._requestBuffer.write(encDatatype);
    }

    private _writeParameters(parameters: Record<string, any>): void {
        this._writeByte(Protocol.DataType.MAP);
        const entries = Object.entries(parameters);
        this._requestBuffer.write(this._encodeSize(entries.length));
        for (const [key, value] of entries) {
            if (typeof key !== 'string') {
                throw new MillenniumDBError('Non-string key found at query parameters');
            }
            this._writeString(key);
            this._writeObject(value);
        }
    }

    private _encodeTypedString(value: string, datatype: Protocol.DataType): Uint8Array {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(value);

        const res: Uint8Array = new Uint8Array(5 + encoded.length);
        res[0] = datatype;
        res.set(this._encodeBytes(encoded), 1);
        return res;
    }

    private _encodeBytes(value: Uint8Array): Uint8Array {
        const res: Uint8Array = new Uint8Array(4 + value.length);
        res.set(this._encodeSize(value.length), 0);
        res.set(value, 4);
        return res;
    }

    private _encodeSize(value: number): Uint8Array {
        const bytes = buffer.Buffer.alloc(4);
        bytes.writeUint32BE(value);
        return bytes as Uint8Array;
    }
}

export default RequestWriter;
