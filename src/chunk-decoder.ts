import IOBuffer from './iobuffer';

import MillenniumDBError from './millenniumdb-error';

/**
 * Decode the incoming data from the server
 */
class ChunkDecoder {
    private static readonly _SEAL: number = 0x00_00;

    private _currentState: ChunkDecoder.State;
    private _currentChunkRemaining: number;
    private readonly _onDecode: (data: IOBuffer) => void;
    private readonly _currentDecodedSlices: Array<IOBuffer>;

    /**
     * This constructor should not be called directly
     *
     * @param onDecode callback that will be called when a chunk is decoded
     */
    constructor(onDecode: (iobuffer: IOBuffer) => void) {
        // The event handler that will be called when a chunk is decoded
        this._onDecode = onDecode;
        // The current state of the decoder
        this._currentState = ChunkDecoder.State.READING_HEADER_FIRST_BYTE;
        // The number of bytes remaining in the current chunk
        this._currentChunkRemaining = 0;
        // The decoded bytes so far
        this._currentDecodedSlices = [];
    }

    /**
     * Initialize the decoding loop until no data is remaining
     *
     * @param iobuffer the data to decode
     */
    decode(iobuffer: IOBuffer) {
        while (iobuffer.hasRemaining()) {
            switch (this._currentState) {
                case ChunkDecoder.State.READING_HEADER_FIRST_BYTE: {
                    this._handleHeaderFirstByte(iobuffer);
                    break;
                }
                case ChunkDecoder.State.READING_HEADER_SECOND_BYTE: {
                    this._handleHeaderSecondByte(iobuffer);
                    break;
                }
                case ChunkDecoder.State.READING_BODY: {
                    this._handleBody(iobuffer);
                    break;
                }
                default: {
                    throw new MillenniumDBError(
                        `ChunkDecoder Error: Invalid state with code 0x${(
                            this._currentState as number
                        ).toString(16)}`
                    );
                }
            }
        }
    }

    private _handleHeaderFirstByte(iobuffer: IOBuffer) {
        if (iobuffer.remaining() > 1) {
            // Header readed entirely
            this._currentChunkRemaining = iobuffer.readUInt16();
            this._handleDecodedHeader();
        } else {
            // Need to receive the second byte
            this._currentChunkRemaining = 0;
            this._currentChunkRemaining |= iobuffer.readUInt8() << 8;
            this._currentState = ChunkDecoder.State.READING_HEADER_SECOND_BYTE;
        }
    }

    private _handleHeaderSecondByte(iobuffer: IOBuffer) {
        this._currentChunkRemaining |= iobuffer.readUInt8();
        this._handleDecodedHeader();
    }

    private _joinDecodedBody(): IOBuffer {
        if (this._currentDecodedSlices.length === 1) {
            return this._currentDecodedSlices[0]!;
        }

        const totalLength = this._currentDecodedSlices.reduce((sum, buf) => sum + buf.length, 0);
        const merged = new ArrayBuffer(totalLength);
        const mergedView = new Uint8Array(merged);

        let offset = 0;
        for (const decodedSlice of this._currentDecodedSlices) {
            mergedView.set(new Uint8Array(decodedSlice.buffer), offset);
            offset += decodedSlice.length;
        }

        return new IOBuffer(merged);
    }

    private _handleDecodedHeader() {
        if (this._currentChunkRemaining === ChunkDecoder._SEAL) {
            // The chunk has been fully read, trigger the decode event
            const body = this._joinDecodedBody();
            this._currentDecodedSlices.length = 0;
            this._currentState = ChunkDecoder.State.READING_HEADER_FIRST_BYTE;
            this._onDecode(body);
        } else {
            // The chunk has not been fully read, read the body
            this._currentState = ChunkDecoder.State.READING_BODY;
        }
    }

    private _handleBody(iobuffer: IOBuffer) {
        const remaining = iobuffer.remaining();
        if (this._currentChunkRemaining > remaining) {
            // Current chunk has missing bytes, read all available bytes and keep the state
            this._currentDecodedSlices.push(iobuffer.readSlice(remaining));
            this._currentChunkRemaining -= remaining;
        } else {
            // Current chunk has all its bytes, read them and reset the state
            this._currentDecodedSlices.push(iobuffer.readSlice(this._currentChunkRemaining));
            this._currentState = ChunkDecoder.State.READING_HEADER_FIRST_BYTE;
        }
    }
}

namespace ChunkDecoder {
    export enum State {
        READING_HEADER_FIRST_BYTE,
        READING_HEADER_SECOND_BYTE,
        READING_BODY,
    }
}

export default ChunkDecoder;
