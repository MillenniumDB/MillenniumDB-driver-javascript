import MillenniumDBError from './millenniumdb-error';

type RecordShape<Value = any> = {
    [key: string]: Value;
};

/**
 * Record represents an entry in the result of a query
 */
class Record {
    public readonly length: number;
    private readonly _variables: Array<string>;
    private readonly _values: Array<any>;
    private readonly _variableToIndex: { [variable: string]: number };

    /**
     * This constructor should not be called directly
     *
     * @param variables the variables of the query
     * @param values the values of the record
     * @param variableToIndex a map from variable to index
     */
    constructor(
        variables: Array<string>,
        values: Array<any>,
        variableToIndex: { [key: string]: number }
    ) {
        if (variables.length !== values.length) {
            throw new MillenniumDBError(
                'Record Error: Number of variables does not match the number of values'
            );
        }

        this._variables = variables;
        this._values = values;
        this._variableToIndex = variableToIndex;
        this.length = variables.length;
    }

    /**
     * Iterate over all entries (key, value)
     *
     * @returns an iterable over all entries
     */
    *entries(): IterableIterator<[string, any]> {
        for (let i = 0; i < this.length; ++i) {
            yield [this._variables[i]!, this._values[i]];
        }
    }

    /**
     * Iterate over all values
     *
     * @returns an iterable over all values
     */
    *values(): IterableIterator<any> {
        for (const value of this._values) {
            yield value;
        }
    }

    /**
     * Iterate over all values. Equivalent to record.values()
     *
     * @returns an iterable over all values
     */
    *[Symbol.iterator](): IterableIterator<any> {
        yield* this.values();
    }

    /**
     * Get the value associated with the key in the record
     *
     * @param key the variable name or its index emmited by the onVariables event
     * @returns the value associated with the key
     */
    get(key: number | string): any {
        let index: number;

        if (typeof key === 'number') {
            index = key;
        } else if (key in this._variableToIndex) {
            index = this._variableToIndex[key]!;
        } else {
            throw new MillenniumDBError(`Record Error: Unknown variable '${key}'`);
        }

        if (index < 0 || index >= this.length) {
            throw new MillenniumDBError(`Record Error: Index ${index} is out of bounds`);
        }

        return this._values[index];
    }

    /**
     * Check if the record has a value associated with the key
     *
     * @param key the variable name or its index emmited by the onVariables event
     * @returns true if the record has a value associated with the key
     */
    has(key: number | string): boolean {
        let index: number;

        if (typeof key === 'number') {
            index = key;
        } else if (key in this._variableToIndex) {
            index = this._variableToIndex[key]!;
        } else {
            return false;
        }

        if (index < 0 || index >= this.length) {
            return false;
        }

        return this._values[index] !== undefined;
    }

    /**
     * Convert the record to an {@link Object}
     *
     * @returns the record as an {@link Object}
     */
    toObject(): Object {
        const res: RecordShape = {};
        for (let i = 0; i < this.length; ++i) {
            res[this._variables[i]!] = this._values[i];
        }
        return res;
    }
}

export default Record;
