import {
    DateTime,
    Decimal,
    Direction,
    GraphAnon,
    GraphEdge,
    GraphNode,
    GraphPath,
    GraphPathSegment,
    IRI,
    SimpleDate,
    StringDatatype,
    StringLang,
    Time,
} from './graph-objects';
import IOBuffer from './iobuffer';
import MillenniumDBError from './millenniumdb-error';
import Protocol from './protocol';

class MessageDecoder {
    decode(iobuffer: IOBuffer): any {
        const type = iobuffer.readUInt8();

        switch (type) {
            case Protocol.DataType.NULL_: {
                return null;
            }
            case Protocol.DataType.BOOL_FALSE: {
                return false;
            }
            case Protocol.DataType.BOOL_TRUE: {
                return true;
            }
            case Protocol.DataType.UINT8: {
                return iobuffer.readUInt8();
            }
            case Protocol.DataType.UINT32: {
                return iobuffer.readUInt32();
            }
            case Protocol.DataType.UINT64: {
                return iobuffer.readUInt64();
            }
            case Protocol.DataType.INT64: {
                return iobuffer.readInt64();
            }
            case Protocol.DataType.FLOAT: {
                return iobuffer.readFloat();
            }
            case Protocol.DataType.DOUBLE: {
                return iobuffer.readDouble();
            }
            case Protocol.DataType.DECIMAL: {
                const decimalString = this._decodeString(iobuffer);
                return new Decimal(decimalString);
            }
            case Protocol.DataType.STRING: {
                return this._decodeString(iobuffer);
            }
            case Protocol.DataType.STRING_LANG: {
                const str = this._decodeString(iobuffer);
                const lang = this._decodeString(iobuffer);
                return new StringLang(str, lang);
            }
            case Protocol.DataType.STRING_DATATYPE: {
                const str = this._decodeString(iobuffer);
                const datatype = this._decodeString(iobuffer);
                return new StringDatatype(str, datatype);
            }
            case Protocol.DataType.IRI: {
                const iri = this._decodeString(iobuffer);
                return new IRI(iri);
            }
            case Protocol.DataType.LIST: {
                return this._decodeList(iobuffer);
            }
            case Protocol.DataType.MAP: {
                return this._decodeMap(iobuffer);
            }
            case Protocol.DataType.NAMED_NODE: {
                const nodeId = this._decodeString(iobuffer);
                return new GraphNode(nodeId);
            }
            case Protocol.DataType.EDGE: {
                const edgeId = this._decodeString(iobuffer);
                return new GraphEdge(edgeId);
            }
            case Protocol.DataType.ANON: {
                const anonId = this._decodeString(iobuffer);
                return new GraphAnon(anonId);
            }
            case Protocol.DataType.DATE: {
                const year = Number(iobuffer.readInt64());
                const month = Number(iobuffer.readInt64());
                const day = Number(iobuffer.readInt64());
                const tzMinuteOffset = Number(iobuffer.readInt64());
                return new SimpleDate(year, month, day, tzMinuteOffset);
            }
            case Protocol.DataType.TIME: {
                const hour = Number(iobuffer.readInt64());
                const minute = Number(iobuffer.readInt64());
                const second = Number(iobuffer.readInt64());
                const tzMinuteOffset = Number(iobuffer.readInt64());
                return new Time(hour, minute, second, tzMinuteOffset);
            }
            case Protocol.DataType.DATETIME: {
                const year = Number(iobuffer.readInt64());
                const month = Number(iobuffer.readInt64());
                const day = Number(iobuffer.readInt64());
                const hour = Number(iobuffer.readInt64());
                const minute = Number(iobuffer.readInt64());
                const second = Number(iobuffer.readInt64());
                const tzMinuteOffset = Number(iobuffer.readInt64());
                return new DateTime(year, month, day, hour, minute, second, tzMinuteOffset);
            }
            case Protocol.DataType.PATH: {
                const pathLength = iobuffer.readUInt32();

                if (pathLength === 0) {
                    const node = this.decode(iobuffer);
                    return new GraphPath(node, node, []);
                }

                const pathSegments: Array<GraphPathSegment> = [];
                let start: any;
                let end: any;
                let from: any = this.decode(iobuffer);
                start = from;
                for (let i = 0; i < pathLength; ++i) {
                    const direction = this._decodeString(iobuffer) as Direction;
                    const type = this.decode(iobuffer);
                    const to = this.decode(iobuffer);
                    pathSegments.push(new GraphPathSegment(from, to, type, direction));
                    from = to;
                }
                end = from;
                return new GraphPath(start, end, pathSegments);
            }
            default:
                throw new MillenniumDBError(
                    `MessageDecoder Error: Unhandled DataType with code: 0x${type.toString(16)}`
                );
        }
    }

    private _decodeString(iobuffer: IOBuffer): string {
        const size = iobuffer.readUInt32();
        return iobuffer.readString(size);
    }

    private _decodeList(iobuffer: IOBuffer): Array<any> {
        const size = iobuffer.readUInt32();
        const res = [];
        for (let i = 0; i < size; ++i) {
            res.push(this.decode(iobuffer));
        }
        return res;
    }

    private _decodeMap(iobuffer: IOBuffer): Record<string, any> {
        const size = iobuffer.readUInt32();
        const res: Record<string, any> = {};
        for (let i = 0; i < size; ++i) {
            const keyType = iobuffer.readUInt8();
            if (keyType !== Protocol.DataType.STRING) {
                throw new MillenniumDBError('MessageDecoder Error: Map keys must be a string');
            }

            const key = this._decodeString(iobuffer);
            const value = this.decode(iobuffer);
            res[key] = value;
        }
        return res;
    }
}

export default MessageDecoder;
