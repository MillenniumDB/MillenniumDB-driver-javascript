namespace Protocol {
    export const DEFAULT_FETCH_SIZE: number = 1024;

    export enum ModelId {
        QUAD_MODEL_ID = 0,
        RDF_MODEL_ID = 1,

        TOTAL,
    }

    export enum DataType {
        NULL_,
        BOOL_FALSE,
        BOOL_TRUE,
        UINT8,
        UINT16,
        UINT32,
        UINT64,
        INT64,
        FLOAT,
        DOUBLE,
        DECIMAL,
        STRING,
        STRING_LANG,
        STRING_DATATYPE,
        IRI,
        NAMED_NODE,
        EDGE,
        ANON,
        DATE,
        TIME,
        DATETIME,
        PATH,
        LIST,
        MAP,

        TOTAL,
    }

    export enum RequestType {
        RUN,
        PULL,
        DISCARD,
        CATALOG,

        TOTAL,
    }

    export enum ResponseType {
        SUCCESS,
        ERROR,
        RECORD,

        TOTAL,
    }
}

export default Protocol;
