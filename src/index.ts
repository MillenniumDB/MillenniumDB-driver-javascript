import Catalog from './catalog';
import CatalogObserver from './catalog-observer';
import ChunkDecoder from './chunk-decoder';
import Driver from './driver';
import {
    DateTime,
    Decimal,
    GraphAnon,
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
import QueryObserver from './query-observer';
import Record from './record';
import ResponseHandler, { ResponseMessage } from './response-handler';
import Result, { ResultObserver } from './result';
import Session from './session';
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
    GraphAnon,
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
        CatalogObserver,
        ChunkDecoder,
        DateTime,
        Decimal,
        Driver,
        GraphAnon,
        GraphEdge,
        GraphNode,
        GraphPath,
        GraphPathSegment,
        IOBuffer,
        IRI,
        MessageDecoder,
        MillenniumDBError,
        QueryObserver,
        Record,
        ResponseHandler,
        ResponseMessage,
        Result,
        ResultObserver,
        Session,
        SimpleDate,
        StringDatatype,
        StringLang,
        Time,
        WebSocketConnection,
        WebSocketType
    };

