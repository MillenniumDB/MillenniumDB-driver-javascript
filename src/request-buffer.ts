import WebSocketConnection from './websocket-connection';
import Protocol from './protocol';

/**

 * Packet format:
 *   [chunk_size][      chunk     ]
 *   [ 2 bytes  ][chunk_size bytes]
 *
 * The seal that marks the end of a message is a "zero-sized chunk" [0x00 0x00]
 */

class RequestBuffer {
    private readonly _connection: WebSocketConnection;
    private _currentPos: number;
    private _chunkOpen: boolean;
    private _currentChunkStartPos: number;
    private _buffer: ArrayBuffer;
    private _view: Uint8Array;

    constructor(connection: WebSocketConnection) {
        this._connection = connection;
        this._currentPos = 0;
        this._chunkOpen = false;
        this._currentChunkStartPos = 0;
        this._buffer = new ArrayBuffer(Protocol.BUFFER_SIZE);
        this._view = new Uint8Array(this._buffer);
    }

    write(data: Uint8Array): void {
        let remainingWrite = data.byteLength;
        let offset = 0;

        while (remainingWrite > 0) {
            this._ensureWriteSpace();

            const maxSpace = this._remainingSpace();
            if (remainingWrite > maxSpace) {
                this._view.set(data.subarray(offset, offset + maxSpace), this._currentPos);
                this._currentPos += maxSpace;
                offset += maxSpace;
                remainingWrite -= maxSpace;
                this.flush();
            } else {
                // all remaining data fits in the buffer
                this._view.set(data.subarray(offset, offset + remainingWrite), this._currentPos);
                this._currentPos += remainingWrite;
                break;
            }
        }
    }

    seal(): void {
        if (this._chunkOpen) {
            this._closeChunk();
        }

        if (this._remainingSpace() < Protocol.CHUNK_HEADER_SIZE) {
            this.flush();
        }

        this._view[this._currentPos] = 0;
        this._view[this._currentPos + 1] = 0;
        this._currentPos += 2;
    }

    flush(): void {
        if (this._chunkOpen) {
            this._closeChunk();
        }

        if (this._currentPos > 0) {
            this._connection.write(this._view.subarray(0, this._currentPos));
            this._currentPos = 0;
        }
    }

    _openChunk(): void {
        this._currentChunkStartPos = this._currentPos;
        this._currentPos += Protocol.CHUNK_HEADER_SIZE;
        this._chunkOpen = true;
    }

    _closeChunk(): void {
        const chunkSize =
            this._currentPos - this._currentChunkStartPos - Protocol.CHUNK_HEADER_SIZE;
        this._view[this._currentChunkStartPos] = (chunkSize >> 8) & 0xff;
        this._view[this._currentChunkStartPos + 1] = chunkSize & 0xff;
        this._chunkOpen = false;
    }

    _ensureWriteSpace(): void {
        const numBytes = this._chunkOpen ? 1 : Protocol.CHUNK_HEADER_SIZE + 1;
        if (this._remainingSpace() < numBytes) {
            this.flush();
        }

        if (!this._chunkOpen) {
            this._openChunk();
        }
    }

    _remainingSpace(): number {
        return Protocol.BUFFER_SIZE - this._currentPos;
    }
}

export default RequestBuffer;
