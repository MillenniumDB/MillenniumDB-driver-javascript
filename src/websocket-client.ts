import MillenniumDBError from './millenniumdb-error';

import { WebSocket as WebSocketNode } from 'ws';

type WebSocketType = WebSocket | WebSocketNode;

/**
 * Create a new WebSocket client either for browser or NodeJS environment
 *
 * @param url the URL of the WebSocket server
 * @returns a new WebSocket client instance
 */
function createWebSocketClient(url: URL): WebSocketType {
    if (
        typeof process !== 'undefined' &&
        process.versions != null &&
        process.versions.node != null
    ) {
        // NodeJS
        return new WebSocketNode(url);
    } else {
        // Browser, WebWorker, others
        if (typeof WebSocket !== undefined) {
            return new WebSocket(url);
        } else if (typeof window?.WebSocket !== undefined) {
            return new window.WebSocket(url);
        } else {
            throw new MillenniumDBError('WebSocket API is not supported in your environment');
        }
    }
}

export { createWebSocketClient, WebSocketType };
