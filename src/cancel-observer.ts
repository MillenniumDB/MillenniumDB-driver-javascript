import MillenniumDBError from './millenniumdb-error';
import { ResponseHandlerObserver } from './response-handler';
import { ResultObserver } from './result';

/**
 * CancelObserver handles the stream of data coming from a cancel request
 */
class CancelObserver implements ResponseHandlerObserver {
    private _error: MillenniumDBError | null;
    private _summary: any | null;
    private _resultObserver: ResultObserver | null;

    /**
     * This constructor should not be called directly
     */
    constructor() {
        this._error = null;
        this._summary = null;
        this._resultObserver = null;
    }

    onVariables(_variables: Array<string>) {
        // Do nothing, should never be called
        throw new MillenniumDBError('CancelObserver Error: onVariables should not be called');
    }

    onRecord(_record: Array<any>) {
        // Do nothing, should never be called
        throw new MillenniumDBError('CancelObserver Error: onRecord should not be called');
    }

    onSuccess(summary: any) {
        this._summary = summary;
        this._resultObserver?.onSuccess?.(this._summary);
    }

    onError(error: MillenniumDBError) {
        this._error = error;
        this._resultObserver?.onError?.(this._error);
    }

    subscribe(resultObserver: ResultObserver): void {
        // Emit pending data if any
        if (this._summary !== null) {
            resultObserver.onSuccess?.(this._summary);
        }

        if (this._error !== null) {
            resultObserver.onError?.(this._error);
        }

        this._resultObserver = resultObserver;
    }
}

export default CancelObserver;
