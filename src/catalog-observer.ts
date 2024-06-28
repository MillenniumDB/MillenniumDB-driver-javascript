import MillenniumDBError from './millenniumdb-error';
import Record from './record';

export interface CatalogResultObserver {
    /** Event handler triggered after a successful execution */
    onSuccess?: (summary: any) => void;
    /** Event handler triggered when an error occurs */
    onError?: (error: MillenniumDBError) => void;
}

/**
 * CatalogObserver handles the stream of data coming from a catalog request
 */
class CatalogObserver {
    private _currentState: CatalogObserver.State;
    private _error: MillenniumDBError | null;
    private _summary: any | null;
    private _resultObservers: Array<CatalogResultObserver>;

    /**
     * This constructor should not be called directly
     */
    constructor() {
        this._currentState = CatalogObserver.State.WAITING_CATALOG_SUCCESS;
        this._error = null;
        this._summary = null;
        this._resultObservers = [];
    }

    subscribe(resultObserver: CatalogResultObserver): void {
        if (resultObserver.onSuccess && this._summary !== null) {
            resultObserver.onSuccess(this._summary);
        }

        if (resultObserver.onError && this._error !== null) {
            resultObserver.onError(this._error);
        }

        this._resultObservers.push(resultObserver);
    }

    onRecord(_record: Record) {
        // Do nothing, should never be called
        throw new MillenniumDBError('CatalogObserver Error: onRecord should not be called');
    }

    onSuccess(summary: any) {
        switch (this._currentState) {
            case CatalogObserver.State.WAITING_CATALOG_SUCCESS: {
                this._currentState = CatalogObserver.State.FINISHED;

                for (const resultObserver of this._resultObservers) {
                    resultObserver.onSuccess?.(summary);
                }

                break;
            }
            default:
                throw new MillenniumDBError(
                    `CatalogObserver Error: Invalid state with code 0x${(
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

        this._currentState = CatalogObserver.State.FINISHED;
    }
}

namespace CatalogObserver {
    export enum State {
        WAITING_CATALOG_SUCCESS,
        FINISHED, // The request has finished either due to success or failure
    }
}

export default CatalogObserver;
