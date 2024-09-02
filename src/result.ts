import MillenniumDBError from './millenniumdb-error';
import QueryObserver from './query-observer';
import Record from './record';

export interface ResultObserver {
    /** Event handler triggered when variables are available. This should be the first event triggered during a query */
    onVariables?: (variables: Array<string>) => void;
    /** Event handler triggered when a record is available */
    onRecord?: (record: Record) => void;
    /** Event handler triggered after a successful execution */
    onSuccess?: (summary: any) => void;
    /** Event handler triggered when an error occurs */
    onError?: (error: MillenniumDBError) => void;
}

/**
 * Result represents the result of a query
 */
class Result {
    private readonly _queryObserver: QueryObserver;
    private _variables: Array<string> | null;
    private _summary: any | null;
    private _error: MillenniumDBError | null;
    private _recordsPromise: Promise<Array<Record>> | null;

    /**
     * This constructor should never be called directly
     *
     * @param queryObserver the {@link QueryObserver} that will handle the received data
     */
    constructor(queryObserver: QueryObserver) {
        this._queryObserver = queryObserver;
        this._variables = null;
        this._summary = null;
        this._error = null;
        this._recordsPromise = null;
    }

    /**
     * Get the variables associated with the result
     *
     * @returns a promise that resolves when the variables are received
     */
    variables(): Promise<Array<string>> {
        // An error has already been thrown
        if (this._error !== null) {
            return Promise.reject(this._error);
        }

        // The variables have already been received
        if (this._variables !== null) {
            return Promise.resolve(this._variables);
        }

        // Wait for the variables to be received
        return new Promise((resolve, reject) => {
            this._queryObserver.subscribe(
                this._wrapObserver({
                    onVariables: (variables) => resolve(variables),
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
            this._queryObserver.subscribe(
                this._wrapObserver({
                    onSuccess: (summary) => resolve(summary),
                    onError: (error) => reject(error),
                })
            );
        });
    }

    /**
     *
     * @param observer the {@link ResultObserver} that will handle the received data
     */
    subscribe(observer: ResultObserver): void {
        this._queryObserver.subscribe(this._wrapObserver(observer));
    }

    unsubscribe(): void {
        this._queryObserver.unsubscribe();
    }

    private _getRecordsPromise(): Promise<Array<Record>> {
        if (this._recordsPromise === null) {
            this._recordsPromise = new Promise((resolve, reject) => {
                const records: Array<Record> = [];
                this._queryObserver.subscribe({
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
     * @param observer the {@link ResultObserver} that will handle the received data
     * @returns the observer wrapped
     */
    private _wrapObserver(observer: ResultObserver): ResultObserver {
        return {
            onVariables: (variables) => {
                this._variables = variables;
                observer.onVariables?.(variables);
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
