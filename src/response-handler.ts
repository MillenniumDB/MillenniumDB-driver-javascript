import CatalogObserver from './catalog-observer';
import MillenniumDBError from './millenniumdb-error';
import Protocol from './protocol';
import StreamObserver from './stream-observer';

export interface ResponseMessage {
    type: number;
    payload: any;
}

/**
 * ResponseHandler handles the responses coming from the server
 */
class ResponseHandler {
    private _currentObserver: StreamObserver | CatalogObserver | null;
    private readonly _pendingObservers: Array<StreamObserver | CatalogObserver>;

    constructor() {
        this._currentObserver = null;
        this._pendingObservers = [];
    }

    /**
     * Handle an incoming response
     *
     * @param message the message to handle
     */
    handle(message: ResponseMessage): void {
        if (typeof message !== 'object') {
            throw new MillenniumDBError(
                'ResponseHandler Error: Response was expected to be an object, but got ' +
                    typeof message +
                    ' instead'
            );
        }

        if (!('type' in message)) {
            throw new MillenniumDBError(
                'ResponseHandler Error: Response object is missing "type" property'
            );
        }

        if (typeof message.type !== 'number') {
            throw new MillenniumDBError(
                'ResponseHandler Error: Response "type" property is expected to be a number, but got ' +
                    typeof message.type +
                    ' instead'
            );
        }

        if (!('payload' in message)) {
            throw new MillenniumDBError(
                'ResponseHandler Error: Response object is missing "payload" property'
            );
        }

        switch (message.type) {
            case Protocol.ResponseType.SUCCESS: {
                this._currentObserver?.onSuccess(message.payload);
                this._nextObserver();
                break;
            }
            case Protocol.ResponseType.ERROR: {
                this._currentObserver?.onError(message.payload);
                this._nextObserver();
                break;
            }
            case Protocol.ResponseType.RECORD: {
                this._currentObserver?.onRecord(message.payload);
                break;
            }
            default:
                throw new MillenniumDBError(
                    `ResponseHandler Error: Unhandled Response Type with code: 0x${message.type.toString(
                        16
                    )}`
                );
                1;
        }
    }

    /**
     * Enqueue a new observer for handling a response
     *
     * @param observer that will handle the received data
     */
    addObserver(observer: StreamObserver | CatalogObserver): void {
        if (this._currentObserver === null) {
            this._currentObserver = observer;
        } else {
            this._pendingObservers.push(observer);
        }
    }

    /**
     * Notify the connection error to current observer and cancel the other observers
     *
     * @param errorString the error to notify
     */
    triggerConnectionError(errorString: string): void {
        this._currentObserver?.onError(errorString);
        this._currentObserver = null;
        this._pendingObservers.length = 0;
    }

    /**
     * Shift the current observer to the next one in the queue
     */
    private _nextObserver(): void {
        const nextObserver = this._pendingObservers.shift();
        this._currentObserver = nextObserver !== undefined ? nextObserver : null;
    }
}

export default ResponseHandler;
