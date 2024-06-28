import IOBuffer from './iobuffer';
import Protocol from './protocol';
import buffer from 'buffer';

/**
 * RequestBuilder is the class that build requests
 */
class RequestBuilder {
    static encodeString(str: string): buffer.Buffer {
        return buffer.Buffer.from(str, 'utf-8');
    }

    /**
     * Builds a request to execute a query
     *
     * @param query the query string to execute
     * @returns the encoded request
     */
    static run(query: string): IOBuffer {
        const queryBytes = RequestBuilder.encodeString(query);
        const queryBytesLength = queryBytes.byteLength;
        const buffer = new ArrayBuffer(6 + queryBytesLength);
        const iobuffer = new IOBuffer(buffer);
        iobuffer.writeUInt8(Protocol.RequestType.RUN);
        iobuffer.writeUInt8(Protocol.DataType.STRING);
        iobuffer.writeUInt32(queryBytesLength);
        iobuffer.writeBytes(queryBytes);
        iobuffer.reset();

        return iobuffer;
    }

    /**
     * Builds a request to pull records from the server
     *
     * @param numRecords the number of records to pull
     * @returns th encoded request
     */
    static pull(numRecords: number): IOBuffer {
        const buffer = new ArrayBuffer(6);
        const iobuffer = new IOBuffer(buffer);
        iobuffer.writeUInt8(Protocol.RequestType.PULL);
        iobuffer.writeUInt8(Protocol.DataType.UINT32);
        iobuffer.writeUInt32(numRecords);
        iobuffer.reset();

        return iobuffer;
    }

    static discard(): IOBuffer {
        const buffer = new ArrayBuffer(1);
        const iobuffer = new IOBuffer(buffer);
        iobuffer.writeUInt8(Protocol.RequestType.DISCARD);
        iobuffer.reset();

        return iobuffer;
    }

    static catalog(): IOBuffer {
        const buffer = new ArrayBuffer(1);
        const iobuffer = new IOBuffer(buffer);
        iobuffer.writeUInt8(Protocol.RequestType.CATALOG);
        iobuffer.reset();

        return iobuffer;
    }
}

export default RequestBuilder;
