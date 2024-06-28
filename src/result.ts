import MillenniumDBError from './millenniumdb-error';
import StreamObserver, { StreamResultObserver } from './stream-observer';
import Record from './record';

/**
 * Result represents the result of a query
 */
class Result {
    private readonly _streamObserver: StreamObserver;
    private _keys: Array<string> | null;
    private _summary: any | null;
    private _error: MillenniumDBError | null;
    private _recordsPromise: Promise<Array<Record>> | null;

    /**
     * This constructor should never be called directly
     *
     * @param streamObserver the {@link StreamObserver} that will handle the received data
     */
    constructor(streamObserver: StreamObserver) {
        this._streamObserver = streamObserver;
        this._keys = null;
        this._summary = null;
        this._error = null;
        this._recordsPromise = null;
    }

    /**
     * Get the keys associated with the result
     *
     * @returns a promise that resolves when the keys are received
     */
    keys(): Promise<Array<string>> {
        // An error has already been thrown
        if (this._error !== null) {
            return Promise.reject(this._error);
        }

        // The keys have already been received
        if (this._keys !== null) {
            return Promise.resolve(this._keys);
        }

        // Wait for the keys to be received
        return new Promise((resolve, reject) => {
            this._streamObserver.subscribe(
                this._wrapObserver({
                    onKeys: (keys) => resolve(keys),
                    onError: (error) => reject(error),
                })
            );
        });
    }

    /**
     * Get the records associated with the result
     *
     * @returns a promise that resolves when the records are received
     */
    records(): Promise<Array<Record>> {
        return this._getRecordsPromise();
    }

    /**
     * Get the summary associated with the result
     *
     * @returns a promise that resolves when the summary is received
     */
    summary(): Promise<any> {
        // An error has already been thrown
        if (this._error !== null) {
            return Promise.reject(this._error);
        }

        // The summary has already been received
        if (this._summary !== null) {
            return Promise.resolve(this._summary);
        }

        // Wait for the summary to be received
        return new Promise((resolve, reject) => {
            this._streamObserver.subscribe(
                this._wrapObserver({
                    onSuccess: (summary) => resolve(summary),
                    onError: (error) => reject(error),
                })
            );
        });
    }

    /**
     *
     * @param observer the {@link StreamResultObserver} that will handle the received data
     */
    subscribe(observer: StreamResultObserver): void {
        this._wrapObserver(observer);
        this._streamObserver.subscribe(observer);
    }

    /**
     * Cancel the query execution
     */
    cancel(): void {
        this._streamObserver.cancel();
    }

    private _getRecordsPromise(): Promise<Array<Record>> {
        if (this._recordsPromise === null) {
            this._recordsPromise = new Promise((resolve, reject) => {
                const records: Array<Record> = [];
                this._streamObserver.subscribe({
                    onRecord: (record) => records.push(record),
                    onSuccess: () => resolve(records),
                    onError: (error) => reject(error),
                });
            });
        }

        return this._recordsPromise;
    }

    /**
     * Wrap the observer in order to store relevant query information
     *
     * @param observer the {@link StreamResultObserver} that will handle the received data
     * @returns the observer wrapped
     */
    private _wrapObserver(observer: StreamResultObserver): StreamResultObserver {
        return {
            onKeys: (keys) => {
                this._keys = keys;
                observer.onKeys?.(keys);
            },
            onRecord: observer.onRecord,
            onSuccess: (summary) => {
                this._summary = summary;
                observer.onSuccess?.(summary);
            },
            onError: (error) => {
                this._error = error;
                observer.onError?.(error);
            },
        };
    }
}

export default Result;
