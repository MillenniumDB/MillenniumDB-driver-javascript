import Catalog from './catalog';
import MillenniumDBError from './millenniumdb-error';
import Session from './session';

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

    /**
     * Get the {@link Catalog} of the remote MillenniumDB instance
     *
     * @returns Promise that will be resolved with the {@link Catalog}
     */
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
    session(): Session {
        this._ensureOpen();
        const session = new Session(this._url);
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

export default Driver;
