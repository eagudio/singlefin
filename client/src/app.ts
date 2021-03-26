module SinglefinModule {
    export class App {
        private _singlefin: Singlefin;
        private _rootPath: string = "";

        
        constructor(_singlefin: Singlefin) {
            this._singlefin = _singlefin;
        }

        get rootPath(): string {
            return this._rootPath;
        }

        set rootPath(value: string) {
            this._rootPath = value;
        }

        get models() {
            return this._singlefin.models;
        }

        open(pageName: string, parameters?: any, models?: any) {
            return this._singlefin.open(this._rootPath + pageName, parameters, models);
        }

        refresh(pageName: string, parameters?: any, models?: any) {
            return this._singlefin.refresh(this._rootPath + pageName, parameters, models);
        }

        close(pageName: string, parameters?: any) {
            return this._singlefin.close(this._rootPath + pageName, parameters);
        }

        openGroupPageByIndex(pageName: string, index: number, parameters?: any, models?: any) {
            return this._singlefin.openGroupPageByIndex(this._rootPath + pageName, index, parameters, models);
        }

        openGroupPage(pageName: string, page: string, parameters?: any, models?: any) {
            return this._singlefin.openGroupPage(this._rootPath + pageName, page, parameters, models);
        }

        setModelValue(property: string, value: any) {
            Runtime.setProperty(property, this._singlefin.models, value);
        }

        getModelValue(property: string) {
            return Runtime.getProperty(this._singlefin.models, property);
        }
    }
}
