class ModelMap {
    private _models: any;


    constructor(models: any) {
        this._models = models;
    }

    getValue(valuePath: string) {
        return Runtime.getProperty(this._models, valuePath);
    }

    setValue(valuePath: string, value: any) {
        Runtime.setProperty(valuePath, this._models, value);
    }
}

/*class ModelMap {
    private _models: any;
    private _map: any;


    constructor(models: any, map: any) {
        this._models = models;
        this._map = map;
    }

    getValue(property: string) {
        var valuePath = this._map[property];

        if(!valuePath) {
            throw new Error("an error occurred during get value from model map: property '" + property + "' does not exist");
        }

        return Runtime.getProperty(this._models, valuePath);
    }

    setValue(property: string, value: any) {
        var valuePath = this._map[property];

        if(!valuePath) {
            throw new Error("an error occurred during set value from model map: property '" + property + "' does not exist");
        }

        Runtime.setProperty(valuePath, this._models, value);
    }
}*/