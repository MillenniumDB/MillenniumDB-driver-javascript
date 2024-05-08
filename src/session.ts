import ChunkDecoder from './chunk-decoder';
import IOBuffer from './iobuffer';
import MessageDecoder from './message-decoder';
import MillenniumDBError from './millenniumdb-error';
import Protocol from './protocol';
import RequestBuilder from './request-builder';
import ResponseHandler, { ResponseMessage } from './response-handler';
import Result from './result';
import StreamObserver from './stream-observer';
import WebSocketConnection from './websocket-connection';

/**
 * Options for {@link Driver.session}
 */
export interface SessionOptions {
    /** The number of records to fetch at a time from the server */
    fetchSize: number;
}

export const DEFAULT_SESSION_OPTIONS: SessionOptions = {
    fetchSize: Protocol.DEFAULT_FETCH_SIZE,
};

/**
 * A Session is used to send queries and receive results from the remote MillenniumDB instance
 */
class Session {
    private _open: boolean;
    private readonly _results: Array<Result>;
    private readonly _options: SessionOptions;
    private readonly _connection: WebSocketConnection;
    private readonly _chunkDecoder: ChunkDecoder;
    private readonly _messageDecoder: MessageDecoder;
    private readonly _responseHandler: ResponseHandler;

    /**
     * This constructor should never be called directly
     *
     * @param url the URL for the MillenniumDB server
     * @param options the options for the {@link Session}
     */
    constructor(url: URL, options: SessionOptions) {
        this._open = true;
        this._results = [];
        this._options = options;
        this._connection = new WebSocketConnection(url, this._onServerMessage);
        this._chunkDecoder = new ChunkDecoder(this._onChunksDecoded);
        this._messageDecoder = new MessageDecoder();
        this._responseHandler = new ResponseHandler();
    }

    /**
     * Sends a request for executing a query to the server
     *
     * @param query the query to execute
     * @returns a {@link Result} for the query
     */
    run(query: string): Result {
        this._ensureOpen();
        const streamObserver = new StreamObserver(
            this._fetchMore.bind(this),
            this._discardAll.bind(this)
        );

        this._send(RequestBuilder.run(query), streamObserver);

        const result = new Result(streamObserver);
        this._results.push(result);
        return result;
    }

    async close(): Promise<void> {
        if (this._open) {
            this._open = false;

            for (const result of this._results) {
                result.cancel();
            }

            await this._connection.close();
        }
    }

    private _ensureOpen(): void {
        if (!this._open) {
            throw new MillenniumDBError('Session Error: session is closed');
        }
    }

    /**
     * Send a request to the server and attach an observer for its response
     *
     * @param iobuffer the data to send
     * @param streamObserver the {@link StreamObserver} that will handle the received data
     */
    private _send(iobuffer: IOBuffer, streamObserver: StreamObserver): void {
        this._responseHandler.addStreamObserver(streamObserver);
        this._connection.write(iobuffer);
    }

    /**
     * Send a request that asks for more records from the server
     *
     * @param streamObserver the {@link StreamObserver} that will handle the received data
     */
    private _fetchMore(streamObserver: StreamObserver): void {
        this._send(RequestBuilder.pull(this._options.fetchSize), streamObserver);
    }

    private _discardAll(streamObserver: StreamObserver): void {
        this._send(RequestBuilder.discard(), streamObserver);
    }

    /**
     * Handler for incoming data from the server
     *
     * @param iobuffer the data received
     */
    private _onServerMessage = (iobuffer: IOBuffer): void => {
        this._chunkDecoder.decode(iobuffer);
    };

    /**
     * Handler for chunks that were decoded
     *
     * @param iobuffer the data received
     */
    private _onChunksDecoded = (iobuffer: IOBuffer): void => {
        const message = this._messageDecoder.decode(iobuffer) as ResponseMessage;
        this._responseHandler.handle(message);
    };
}

export default Session;
