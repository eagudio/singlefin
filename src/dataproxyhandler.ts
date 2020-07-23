module SinglefinModule {
    export class DataProxyHandler {
        private _parameters: any;
        private _handler: any = null;


        constructor(parameters: any, handler: any) {
            this._parameters = parameters;
            this._handler = handler;
        }

        public get parameters(): any {
            return this._parameters;
        }

        public get handler(): any {
            return this._handler;
        }
    }
}