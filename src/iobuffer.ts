import MillenniumDBError from './millenniumdb-error';

import buffer from 'buffer';

/**
 * IOBuffer is a class that can be used to read and write data to and from a binary buffer
 */
class IOBuffer {
    public readonly buffer: buffer.Buffer;
    public readonly length: number;
    private _currentPosition: number;

    /**
     * This constructor should not be called directly
     *
     * @param arg the buffer to use
     */
    constructor(arg: ArrayBuffer | buffer.Buffer) {
        if (arg instanceof ArrayBuffer) {
            this.buffer = buffer.Buffer.from(arg);
        } else if (arg instanceof buffer.Buffer) {
            this.buffer = arg;
        } else {
            throw new MillenniumDBError('IOBuffer Error: Invalid argument with type ' + typeof arg);
        }

        this.length = this.buffer.length;
        this._currentPosition = 0;
    }

    readUInt8(): number {
        return this.buffer.readUInt8(this._updateCurrentPosition(1));
    }

    readUInt16(): number {
        return this.buffer.readUInt16BE(this._updateCurrentPosition(2));
    }

    readUInt32(): number {
        return this.buffer.readUInt32BE(this._updateCurrentPosition(4));
    }

    readUInt64(): bigint {
        return this.buffer.readBigUInt64BE(this._updateCurrentPosition(8));
    }

    readInt64(): bigint {
        return this.buffer.readBigInt64BE(this._updateCurrentPosition(8));
    }

    readFloat(): number {
        return this.buffer.readFloatBE(this._updateCurrentPosition(4));
    }

    readSlice(numBytes: number): IOBuffer {
        return new IOBuffer(
            this.buffer.subarray(this._updateCurrentPosition(numBytes), this._currentPosition)
        );
    }

    readString(numBytes: number): string {
        return this.buffer.toString(
            'utf-8',
            this._updateCurrentPosition(numBytes),
            this._currentPosition
        );
    }

    writeUInt8(value: number): void {
        this.buffer.writeUInt8(value, this._updateCurrentPosition(1));
    }

    writeUInt16(value: number): void {
        this.buffer.writeUInt16BE(value, this._updateCurrentPosition(2));
    }

    writeUInt32(value: number): void {
        this.buffer.writeUInt32BE(value, this._updateCurrentPosition(4));
    }

    writeBytes(value: buffer.Buffer): void {
        this.buffer.set(value, this._updateCurrentPosition(value.length));
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
