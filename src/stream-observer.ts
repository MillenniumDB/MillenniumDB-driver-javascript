import Record from './record';
import MillenniumDBError from './millenniumdb-error';

export interface StreamResultObserver {
    /** Event handler triggered when keys are available. This should be the first event triggered during a query */
    onKeys?: (keys: Array<string>) => void;
    /** Event handler triggered when a record is available */
    onRecord?: (record: Record) => void;
    /** Event handler triggered after a successful execution */
    onSuccess?: (summary: any) => void;
    /** Event handler triggered when an error occurs */
    onError?: (error: MillenniumDBError) => void;
}

/**
 * StreamObserver handles the stream of data coming from the server. Used for queries
 */
class StreamObserver {
    private _currentState: StreamObserver.State;
    private _keys: Array<string>;
    private _keyToIndex: { [key: string]: number };
    private _error: MillenniumDBError | null;
    private _summary: any | null;
    private _resultObservers: Array<StreamResultObserver>;
    private readonly _pendingRecords: Array<Record>;
    private readonly _fetchMore: () => void;
    private readonly _discardAll: () => void;

    /**
     * This constructor should not be called directly
     *
     * @param fetchMore the function that will be used fetch more data from the server
     */
    constructor(
        fetchMore: (streamObserver: StreamObserver) => void,
        discard: (streamObserver: StreamObserver) => void
    ) {
        this._currentState = StreamObserver.State.WAITING_RUN_SUCCESS;
        // When triggering the onKeys event, this.keys must be cloned as the user might modify it and they are
        // necessary for class the Record class constructor
        this._keys = [];
        this._keyToIndex = {};
        this._pendingRecords = [];
        this._error = null;
        this._summary = null;
        this._resultObservers = [];
        this._fetchMore = () => fetchMore(this);
        this._discardAll = () => discard(this);
    }

    subscribe(resultObserver: StreamResultObserver): void {
        // Emit pending data if any
        if (resultObserver.onKeys && this._keys.length > 0) {
            resultObserver.onKeys(this._keys);
        }

        if (resultObserver.onRecord && this._pendingRecords.length > 0) {
            for (const record of this._pendingRecords) {
                resultObserver.onRecord(record);
            }
            this._pendingRecords.length = 0;
        }

        if (resultObserver.onSuccess && this._summary !== null) {
            resultObserver.onSuccess(this._summary);
        }

        if (resultObserver.onError && this._error !== null) {
            resultObserver.onError(this._error);
        }

        this._resultObservers.push(resultObserver);
    }

    onRecord(values: Array<any>) {
        const record = new Record(this._keys, values, this._keyToIndex);
        if (this._resultObservers.some((resultObserver) => resultObserver.onRecord)) {
            for (const resultObserver of this._resultObservers) {
                resultObserver.onRecord?.(record);
            }
        } else {
            this._pendingRecords.push(record);
        }
    }

    onSuccess(summary: any) {
        switch (this._currentState) {
            case StreamObserver.State.WAITING_RUN_SUCCESS: {
                this._currentState = StreamObserver.State.WAITING_PULL_OR_DISCARD_SUCCESS;

                // The success of a RUN request
                this._keys = summary.projectionVariables;
                for (let i = 0; i < this._keys.length; ++i) {
                    this._keyToIndex[this._keys[i]!] = i;
                }

                for (const resultObserver of this._resultObservers) {
                    resultObserver.onKeys?.(this._keys);
                }

                this._fetchMore();
                break;
            }
            case StreamObserver.State.WAITING_PULL_OR_DISCARD_SUCCESS: {
                // The success of a PULL/DISCARD request
                if (summary.hasNext) {
                    this._fetchMore();
                } else {
                    this._currentState = StreamObserver.State.FINISHED;

                    this._summary = summary;
                    for (const resultObserver of this._resultObservers) {
                        resultObserver.onSuccess?.(this._summary);
                    }
                }
                break;
            }
            default:
                throw new MillenniumDBError(
                    `StreamObserver Error: Invalid state with code 0x${(
                        this._currentState as number
                    ).toString(16)}`
                );
        }
    }

    onError(errorString: string) {
        this._error = new MillenniumDBError(errorString);

        for (const resultObserver of this._resultObservers) {
            resultObserver.onError?.(this._error);
        }

        this._currentState = StreamObserver.State.FINISHED;
    }

    cancel(): void {
        if (this._currentState !== StreamObserver.State.FINISHED) {
            this._resultObservers.length = 0;
            this._discardAll();
            this._currentState = StreamObserver.State.WAITING_PULL_OR_DISCARD_SUCCESS;
        }
    }
}

namespace StreamObserver {
    export enum State {
        WAITING_RUN_SUCCESS,
        WAITING_PULL_OR_DISCARD_SUCCESS,
        FINISHED, // The query has finished either due to success or failure
    }
}

export default StreamObserver;
