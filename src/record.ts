import MillenniumDBError from './millenniumdb-error';

type RecordShape<Value = any> = {
    [key: string]: Value;
};

/**
 * Record represents an entry in the result of a query
 */
class Record {
    public readonly length: number;
    private readonly _keys: Array<string>;
    private readonly _values: Array<any>;
    private readonly _keyToIndex: { [key: string]: number };

    /**
     * This constructor should not be called directly
     *
     * @param keys the keys of the query
     * @param values the values of the record
     * @param keyToIndex a map from key to index
     */
    constructor(keys: Array<string>, values: Array<any>, keyToIndex: { [key: string]: number }) {
        if (keys.length !== values.length) {
            throw new MillenniumDBError(
                'Record Error: Number of variables does not match the number of values'
            );
        }

        this._keys = keys;
        this._values = values;
        this._keyToIndex = keyToIndex;
        this.length = keys.length;
    }

    /**
     * Iterate over all entries (key, value)
     *
     * @returns an iterable over all entries
     */
    *entries(): IterableIterator<[string, any]> {
        for (let i = 0; i < this.length; ++i) {
            yield [this._keys[i]!, this._values[i]];
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
     * @param key the variable name or its index emmited by the onKeys event
     * @returns the value associated with the key
     */
    get(key: number | string): any {
        const index: number = typeof key === 'number' ? key : this._keyToIndex[key] ?? -1;
        if (index > this.length - 1 || index < 0) {
            throw new MillenniumDBError('Record Error: Index ' + index + ' is out of bounds');
        }

        return this._values[index];
    }

    /**
     * Check if the record has a value associated with the key
     *
     * @param key the variable name or its index emmited by the onKeys event
     * @returns true if the record has a value associated with the key
     */
    has(key: number | string): boolean {
        const index: number = typeof key == 'number' ? key : this._keys.indexOf(key);
        return index < this.length && index > -1;
    }

    /**
     * Convert the record to an {@link Object}
     *
     * @returns the record as an {@link Object}
     */
    toObject(): Object {
        const res: RecordShape = {};
        for (let i = 0; i < this.length; ++i) {
            res[this._keys[i]!] = this._values[i];
        }
        return res;
    }
}

export default Record;
