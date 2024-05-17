import { DateTime, Edge, Node, Path, PathSegment } from './graph-objects';
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
            case Protocol.DataType.INT64: {
                return iobuffer.readUInt64();
            }
            case Protocol.DataType.FLOAT: {
                return iobuffer.readFloat();
            }
            case Protocol.DataType.STRING: {
                return this._decodeString(iobuffer);
            }
            case Protocol.DataType.LIST: {
                return this._decodeList(iobuffer);
            }
            case Protocol.DataType.MAP: {
                return this._decodeMap(iobuffer);
            }
            case Protocol.DataType.NAMED_NODE: {
                const nodeName = this._decodeString(iobuffer);
                return new Node(nodeName);
            }
            case Protocol.DataType.EDGE: {
                const edgeName = this._decodeString(iobuffer);
                return new Edge(edgeName);
            }
            case Protocol.DataType.DATETIME: {
                const dateTimeString = this._decodeString(iobuffer);
                return new DateTime(dateTimeString);
            }
            case Protocol.DataType.PATH: {
                const pathLength = iobuffer.readUInt32();

                if (pathLength === 0) {
                    const node = this.decode(iobuffer);
                    return new Path(node, node, []);
                }

                const pathSegments: Array<PathSegment> = [];
                let reverse: boolean;
                let start, end, from, to, type: Node;
                from = this.decode(iobuffer);
                start = from;
                for (let i = 0; i < pathLength; ++i) {
                    reverse = this.decode(iobuffer);
                    type = this.decode(iobuffer);
                    to = this.decode(iobuffer);
                    pathSegments.push(new PathSegment(from, to, type, reverse));
                    from = to;
                }
                end = from;
                return new Path(start, end, pathSegments);
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
