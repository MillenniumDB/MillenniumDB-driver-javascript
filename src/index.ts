import ChunkDecoder from './chunk-decoder';
import Driver from './driver';
import { DateTime, Edge, Node, Path, PathSegment } from './graph-objects';
import IOBuffer from './iobuffer';
import MessageDecoder from './message-decoder';
import MillenniumDBError from './millenniumdb-error';
import Record from './record';
import ResponseHandler, { ResponseMessage } from './response-handler';
import Result from './result';
import Session, { SessionOptions } from './session';
import StreamObserver, { ResultObserver, Summary } from './stream-observer';
import {WebSocketType} from './websocket-client';
import WebSocketConnection from './websocket-connection';

/**
 * Construct a new MillenniumDB driver. This is the entry point to the library.
 *
 * @param url the URL for the MillenniumDB server
 * @returns a new driver instance
 */
const driver = (url: string): Driver => {
    return new Driver(url);
};

export default { driver };
export { driver };

// Some types may be innecessary for the user, but I want to expose them in the documentation
export type {
    ChunkDecoder,
    DateTime,
    Driver,
    Edge,
    IOBuffer,
    MessageDecoder,
    MillenniumDBError,
    Node,
    Path,
    PathSegment,
    Record,
    ResponseHandler,
    ResponseMessage,
    Result,
    ResultObserver,
    Session,
    SessionOptions,
    StreamObserver,
    Summary,
    WebSocketConnection,
    WebSocketType,
};
