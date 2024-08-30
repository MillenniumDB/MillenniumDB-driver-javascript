import Record from './record';
import MillenniumDBError from './millenniumdb-error';
import { ResponseHandlerObserver } from './response-handler';
import { ResultObserver } from './result';

/**
 * StreamObserver handles the stream of data coming from the server. It stores the result until the subscription is established
 */
class QueryObserver implements ResponseHandlerObserver {
    private _variables: Array<string>;
    private _variableToIndex: { [key: string]: number };
    private _error: MillenniumDBError | null;
    private _summary: any | null;
    private _resultObserver: ResultObserver | null;
    private readonly _pendingRecords: Array<Record>;
    /**
     * This constructor should not be called directly
     */
    constructor() {
        // When triggering the onVariables event, this._variables must be cloned as the user might modify it and they are
        // necessary for class the Record class constructor
        this._variables = [];
        this._variableToIndex = {};
        this._error = null;
        this._summary = null;
        this._resultObserver = null;
        this._pendingRecords = [];
    }

    onVariables(variables: Array<string>) {
        this._variables = variables;

        for (let i = 0; i < this._variables.length; ++i) {
            this._variableToIndex[this._variables[i]!] = i;
        }

        this._resultObserver?.onVariables?.(this._variables);
    }

    onRecord(values: Array<any>) {
        const record = new Record(this._variables, values, this._variableToIndex);
        if (!this._resultObserver) {
            this._pendingRecords.push(record);
            return;
        }

        this._resultObserver.onRecord?.(record);
    }

    onSuccess(summary: any) {
        this._summary = summary;
        this._resultObserver?.onSuccess?.(this._summary);
    }

    onError(error: MillenniumDBError) {
        this._error = error;
        this._resultObserver?.onError?.(this._error);
    }

    subscribe(resultObserver: ResultObserver) {
        // Emit pending data if any
        if (this._variables.length > 0) {
            resultObserver.onVariables?.(this._variables);
        }

        if (this._pendingRecords.length > 0) {
            for (const record of this._pendingRecords) {
                resultObserver.onRecord?.(record);
            }
            this._pendingRecords.length = 0;
        }

        if (this._summary !== null) {
            resultObserver.onSuccess?.(this._summary);
        }

        if (this._error !== null) {
            resultObserver.onError?.(this._error);
        }

        this._resultObserver = resultObserver;
    }
}

export default QueryObserver;
