class ModelMap {
    private _models: any;


    constructor(models: any) {
        this._models = models;
    }

    getParentInstance(valuePath: string) {
        return Runtime.getParentInstance(this._models, valuePath);
    }

    getValue(valuePath: string) {
        return Runtime.getProperty(this._models, valuePath);
    }

    setValue(valuePath: string, value: any) {
        Runtime.setProperty(valuePath, this._models, value);
    }
}
