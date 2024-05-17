import IOBuffer from './iobuffer';
import RequestBuffer from './iobuffer';
import { createWebSocketClient, WebSocketType } from './websocket-client';

/**
 * The WebSocket connection is the main class that holds a connection between the client and the server
 */
class WebSocketConnection {
    private _open: boolean;
    private _wsOpen: boolean;
    private _closingPromise: Promise<void> | null;
    private readonly _onMessage: (iobuffer: IOBuffer) => void;
    private readonly _onError: (error: string) => void;
    private readonly _pendingRequests: Array<RequestBuffer>;
    private readonly _ws: WebSocketType;

    /**
     * This constructor should not be called directly
     *
     * @param url the URL of the remote MillenniumDB server
     * @param onMessage the callback that will handle the received data
     */
    constructor(
        url: URL,
        onMessage: (iobuffer: IOBuffer) => void,
        onError: (error: string) => void
    ) {
        // Event handlers
        this._onMessage = onMessage;
        this._onError = onError;
        // The connection is logically open
        this._open = true;
        // The connection is established
        this._wsOpen = false;
        // Requests waiting to be written when the connection is established
        this._pendingRequests = [];
        // Promise that will be resolved when the connection is closed
        this._closingPromise = null;
        // The WebSocket instance
        this._ws = this._createWebSocket(url);
    }

    /**
     * Write a request. If the connection is not established yet, it will be enqueued
     * @param iobuffer a buffer containing the request
     */
    write(iobuffer: IOBuffer): void {
        this._ensureOpen();

        if (!this._wsOpen) {
            this._pendingRequests.push(iobuffer);
            return;
        }

        this._ws.send(iobuffer.buffer);
    }

    /**
     * Close the connection
     * @returns Promise that will be resolved when the connection is closed
     */
    close(): Promise<void> {
        if (this._closingPromise === null) {
            this._closingPromise = new Promise((resolve, _) => {
                if (this._ws.readyState !== 3) {
                    // 3 === WebSocket.CLOSED
                    this._open = false;
                    this._ws.onclose = () => {
                        this._wsOpen = false;
                        resolve();
                    };
                    this._ws.close();
                    return;
                }

                resolve();
            });
        }

        return this._closingPromise;
    }

    private _ensureOpen(): void {
        if (!this._open) {
            this._onError('WebSocketConnection Error: connection is closed');
        }
    }

    /**
     * Create the WebSocket instance for the connection
     * @returns the WebSocket instance
     */
    private _createWebSocket(url: URL): WebSocketType {
        const ws = createWebSocketClient(url);
        ws.binaryType = 'arraybuffer';

        ws.onopen = () => {
            // Connection is established
            this._wsOpen = true;

            // Write all pending requests as the connection is now established
            for (const requestBuffer of this._pendingRequests) {
                this.write(requestBuffer);
            }
            this._pendingRequests.length = 0;
        };

        ws.onclose = (event: CloseEvent) => {
            if (!event.wasClean) {
                this._onError('WebSocketConnection Error: Connection was closed abnormally');
            }

            this._open = false;
        };

        ws.onmessage = (event: MessageEvent) => {
            this._onMessage(new IOBuffer(event.data));
        };

        ws.onerror = () => {
            this._onError(`WebSocketConnection Error: Is the server running at ${url}?`);
        };

        return ws;
    }
}

export default WebSocketConnection;
