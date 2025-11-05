import MillenniumDBError from './millenniumdb-error';

/**
 * IOBuffer is a class that can be used to read and write data to and from a binary buffer
 */
class IOBuffer {
    public readonly buffer: ArrayBuffer;
    public readonly length: number;
    public readonly _view: DataView;
    private _currentPosition: number;
    private _decoder = new TextDecoder('utf-8');

    /**
     * This constructor should not be called directly
     *
     * @param arg the buffer to use
     */
    constructor(arg: ArrayBuffer) {
        this.buffer = arg;
        this.length = this.buffer.byteLength;
        this._view = new DataView(this.buffer);
        this._currentPosition = 0;
    }

    readUInt8(): number {
        return this._view.getUint8(this._updateCurrentPosition(1));
    }

    readUInt16(): number {
        return this._view.getUint16(this._updateCurrentPosition(2));
    }

    readUInt32(): number {
        return this._view.getUint32(this._updateCurrentPosition(4));
    }

    readUInt64(): bigint | number {
        const value = this._view.getBigUint64(this._updateCurrentPosition(8));
        if (Number.MIN_SAFE_INTEGER <= value && value <= Number.MAX_SAFE_INTEGER) {
            return Number(value);
        }
        return value;
    }

    readInt64(): bigint | number {
        const value = this._view.getBigInt64(this._updateCurrentPosition(8));
        if (Number.MIN_SAFE_INTEGER <= value && value <= Number.MAX_SAFE_INTEGER) {
            return Number(value);
        }
        return value;
    }

    readFloat(): number {
        return this._view.getFloat32(this._updateCurrentPosition(4));
    }

    readDouble(): number {
        return this._view.getFloat64(this._updateCurrentPosition(8));
    }

    readSlice(numBytes: number): IOBuffer {
        return new IOBuffer(
            this.buffer.slice(this._updateCurrentPosition(numBytes), this._currentPosition)
        );
    }

    readString(numBytes: number): string {
        const slice = new Uint8Array(
            this._view.buffer,
            this._updateCurrentPosition(numBytes),
            numBytes
        );
        return this._decoder.decode(slice);
    }

    remaining(): number {
        return this.length - this._currentPosition;
    }

    hasRemaining(): boolean {
        return this.remaining() > 0;
    }

    reset(): void {
        this._currentPosition = 0;
    }

    /**
     * Update the position of the pointer
     * @param numBytes the number of bytes to advance the pointer
     * @returns the previous position
     */
    private _updateCurrentPosition(numBytes: number): number {
        if (this._currentPosition + numBytes > this.length) {
            throw new MillenniumDBError(
                'IOBuffer Error: Attempted to perform an operation past the end of the buffer'
            );
        }

        const previousPosition = this._currentPosition;
        this._currentPosition += numBytes;
        return previousPosition;
    }
}

export default IOBuffer;
