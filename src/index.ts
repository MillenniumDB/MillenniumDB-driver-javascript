import Catalog from './catalog';
import ChunkDecoder from './chunk-decoder';
import Driver from './driver';
import {
    DateTime,
    Decimal,
    GraphEdge,
    GraphNode,
    GraphPath,
    GraphPathSegment,
    IRI,
    SimpleDate,
    StringDatatype,
    StringLang,
    Time,
} from './graph-objects';
import IOBuffer from './iobuffer';
import MessageDecoder from './message-decoder';
import MillenniumDBError from './millenniumdb-error';
import Record from './record';
import ResponseHandler, { ResponseMessage } from './response-handler';
import Result from './result';
import Session, { SessionOptions } from './session';
import StreamObserver, { StreamResultObserver } from './stream-observer';
import { WebSocketType } from './websocket-client';
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

const types = {
    DateTime,
    Decimal,
    GraphEdge,
    GraphNode,
    GraphPath,
    GraphPathSegment,
    IRI,
    Result,
    Record,
    SimpleDate,
    StringDatatype,
    StringLang,
    Time,
};

export default { driver };
export { driver, types };

// Some types may be innecessary for the user, but I want to expose them in the documentation
export type {
    Catalog,
    ChunkDecoder,
    DateTime,
    Decimal,
    Driver,
    GraphEdge,
    GraphNode,
    GraphPath,
    GraphPathSegment,
    IOBuffer,
    IRI,
    MessageDecoder,
    MillenniumDBError,
    Record,
    ResponseHandler,
    ResponseMessage,
    Result,
    StreamResultObserver as ResultObserver,
    Session,
    SessionOptions,
    SimpleDate,
    StreamObserver,
    StringDatatype,
    StringLang,
    Time,
    WebSocketConnection,
    WebSocketType,
};
