namespace Protocol {
    export const DEFAULT_FETCH_SIZE: number = 1024;

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
        STRING,
        NAMED_NODE,
        EDGE,
        ANON,
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
