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

        get model() {
            return this._singlefin.model;
        }

        open(pageName: string, parameters?: any) {
            return this._singlefin.open(this._rootPath + pageName, parameters);
        }

        refresh(pageName: string, parameters: any) {
            return this._singlefin.refresh(this._rootPath + pageName, parameters);
        }

        close(pageName: string, parameters?: any) {
            return this._singlefin.close(this._rootPath + pageName, parameters);
        }

        openGroupStep(pageName: string, index: number, parameters: any) {
            return this._singlefin.openGroupStep(this._rootPath + pageName, index, parameters);
        }
    }
}
