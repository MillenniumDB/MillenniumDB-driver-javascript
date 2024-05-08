/**
 * This class represents an error that has been thrown by the driver
 */
class MillenniumDBError extends Error {
    constructor(message: string) {
        super(message);

        this.name = 'MillenniumDBError';
    }
}

export default MillenniumDBError;
