import Catalog from './catalog';
import MillenniumDBError from './millenniumdb-error';
import Protocol from './protocol';
import Session, { DEFAULT_SESSION_OPTIONS, SessionOptions } from './session';

/**
 * A driver that can hold multiple {@link Session}s with a remote MillenniumDB instance. The {@link Session}s have
 * the interface for sending queries and receiving results. It is expected that an application holds a single
 * driver instance.
 */
class Driver {
    private _open: boolean;
    private readonly _url: URL;
    private readonly _sessions: Array<Session>;

    /**
     * This constructor should never be called directly
     *
     * @param url the URL for the MillenniumDB server
     */
    constructor(url: string) {
        this._open = true;
        this._url = new URL(url);
        this._sessions = [];
    }

    async catalog(): Promise<Catalog> {
        const session = this.session();
        try {
            return await session.catalog();
        } catch (error) {
            throw error;
        } finally {
            session.close();
        }
    }

    /**
     * Create a {@link Session}, establishing a new connection with the remote MillenniumDB instance.
     * The {@link Session} must be closed when your operations are done.
     *
     * @param options the options for the {@link Session}
     * @returns a new {@link Session} instance
     */
    session(options: SessionOptions = DEFAULT_SESSION_OPTIONS): Session {
        this._ensureOpen();
        validateSessionOptions(options);
        const session = new Session(this._url, options);
        this._sessions.push(session);
        return session;
    }

    /**
     * Close all open {@link Session}s
     *
     * @returns Promise that will be resolved when all {@link Session}s are closed
     */
    async close(): Promise<void> {
        if (this._open) {
            this._open = false;
            await Promise.all(this._sessions.map((session) => session.close()));
        }
        return Promise.resolve();
    }

    private _ensureOpen(): void {
        if (!this._open) {
            throw new MillenniumDBError('Driver Error: driver is closed');
        }
    }
}

/**
 * Validate the options for {@link Session} if any throwing errors if necessary. If no options are
 * provided, default values will be used.
 *
 * @param options the options for the {@link Session}
 */
function validateSessionOptions(options: SessionOptions): void {
    checkIsNonNegativeNumber(options.fetchSize ?? Protocol.DEFAULT_FETCH_SIZE, 'fetchSize');
}

/**
 * Helper function that throws a {@link MillenniumDBError} when the value is not a non-negative number
 *
 * @param value the value to check
 * @param variableName the variable name for the error
 */
function checkIsNonNegativeNumber(value: number, variableName: string): void {
    if (typeof value !== 'number') {
        throw new MillenniumDBError(
            'Driver Error: ' + variableName + ' must be a number, but got ' + typeof value
        );
    }

    if (value < 0) {
        throw new MillenniumDBError('Driver Error: ' + variableName + ' must be non-negative');
    }
}

export default Driver;
