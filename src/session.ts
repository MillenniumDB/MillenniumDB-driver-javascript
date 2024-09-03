import CancelObserver from './cancel-observer';
import Catalog from './catalog';
import CatalogObserver from './catalog-observer';
import ChunkDecoder from './chunk-decoder';
import IOBuffer from './iobuffer';
import MessageDecoder from './message-decoder';
import MillenniumDBError from './millenniumdb-error';
import QueryObserver from './query-observer';
import RequestBuilder from './request-builder';
import ResponseHandler, { ResponseHandlerObserver, ResponseMessage } from './response-handler';
import Result from './result';
import WebSocketConnection from './websocket-connection';

/**
 * A Session is used to send queries and receive results from the remote MillenniumDB instance
 */
class Session {
    private _open: boolean;
    private readonly _connection: WebSocketConnection;
    private readonly _chunkDecoder: ChunkDecoder;
    private readonly _messageDecoder: MessageDecoder;
    private readonly _responseHandler: ResponseHandler;
    private readonly _results: Array<Result>;

    /**
     * This constructor should never be called directly
     *
     * @param url the URL for the MillenniumDB server
     * @param options the options for the {@link Session}
     */
    constructor(url: URL) {
        this._open = true;
        this._chunkDecoder = new ChunkDecoder(this._onChunksDecoded);
        this._messageDecoder = new MessageDecoder();
        this._responseHandler = new ResponseHandler();
        this._results = [];
        this._connection = new WebSocketConnection(
            url,
            this._onServerMessage.bind(this),
            this._responseHandler.triggerConnectionError.bind(this._responseHandler)
        );
    }

    /**
     * Get the {@link Catalog} of the remote MillenniumDB instance
     *
     * @returns Promise that will be resolved with the {@link Catalog}
     */
    async catalog(): Promise<Catalog> {
        this._ensureOpen();
        const catalogObserver = new CatalogObserver();
        this._send(RequestBuilder.catalog(), catalogObserver);
        return new Promise((resolve, reject) => {
            catalogObserver.subscribe({
                onSuccess: (summary) => {
                    resolve(new Catalog(summary));
                },
                onError: (error) => {
                    reject(error);
                },
            });
        });
    }

    /**
     * Sends a request for executing a query to the server
     *
     * @param query the query to execute
     * @returns a {@link Result} for the query
     */
    run(query: string): Result {
        this._ensureOpen();
        const queryObserver = new QueryObserver();
        this._send(RequestBuilder.run(query), queryObserver);

        const result = new Result(queryObserver);
        this._results.push(result);
        return result;
    }

    async close(): Promise<void> {
        if (this._open) {
            this._open = false;
            for (const result of this._results) {
                result.unsubscribe();
            }
            await this._connection.close();
        }
    }

    /**
     * Try to cancel another query given a {@link Result}. This method should be called exclusively by driver
     *
     * @param result the {@link Result} to cancel
     * @returns a promise that resolves when the query is cancelled
     */
    async _cancel(result: Result): Promise<void> {
        this._ensureOpen();

        if (!result._queryPreamble) {
            return Promise.reject(
                new MillenniumDBError('Session Error: query has not been executed yet')
            );
        }

        const cancelObserver = new CancelObserver();
        const { workerIndex, cancellationToken } = result._queryPreamble!;
        this._send(RequestBuilder.cancel(workerIndex, cancellationToken), cancelObserver);
        return new Promise((resolve, reject) => {
            cancelObserver.subscribe({
                onSuccess: () => {
                    resolve();
                },
                onError: (error) => {
                    reject(error);
                },
            });
        });
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
     * @param observer that will handle the received data
     */
    private _send(iobuffer: IOBuffer, observer: ResponseHandlerObserver): void {
        this._responseHandler.addObserver(observer);
        this._connection.write(iobuffer);
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
