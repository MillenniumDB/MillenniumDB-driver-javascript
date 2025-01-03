import MillenniumDBError from './millenniumdb-error';
import Protocol from './protocol';

class Catalog {
    private readonly _modelId: Protocol.ModelId;
    private readonly _version: number;
    private readonly _metadata: any;

    constructor(summary: any) {
        this._modelId = Number(summary.modelId);
        this._version = Number(summary.version);
        this._metadata = summary.metadata;
        this._validateModelId(this._modelId);
    }

    public getModelString(): string {
        switch (this._modelId) {
            case Protocol.ModelId.QUAD_MODEL_ID:
                return 'quad';
            case Protocol.ModelId.RDF_MODEL_ID:
                return 'rdf';
            case Protocol.ModelId.GQL_MODEL_ID:
                return 'gql';
            default:
                throw new MillenniumDBError('Catalog Error: Invalid ModelId ' + this._modelId);
        }
    }

    public getModelId(): Protocol.ModelId {
        return this._modelId;
    }

    public getVersion(): number {
        return this._version;
    }

    public getMetadata(): any {
        return this._metadata;
    }

    private _validateModelId(modelId: Protocol.ModelId): void {
        if (modelId < 0 || modelId >= Protocol.ModelId.TOTAL) {
            throw new MillenniumDBError('Catalog Error: Invalid ModelId ' + modelId);
        }
    }
}

export default Catalog;
