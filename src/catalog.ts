import MillenniumDBError from './millenniumdb-error';
import Protocol from './protocol';

class Catalog {
    private readonly _modelId: Protocol.ModelId;
    private readonly _version: number;

    constructor(summary: any) {
        this._modelId = summary.modelId;
        this._version = summary.version;
        this._validateModelId(this._modelId);
    }

    public getModelId(): Protocol.ModelId {
        return this._modelId;
    }

    public getVersion(): number {
        return this._version;
    }

    private _validateModelId(modelId: Protocol.ModelId): void {
        if (modelId < 0 || modelId >= Protocol.ModelId.TOTAL) {
            throw new MillenniumDBError('Catalog Error: Invalid ModelId ' + modelId);
        }
    }
}

export default Catalog;
