module SinglefinModule {
    export class DataProxy {
        private _data: any;
        private _parameters: any;
        private _proxy: any = null;
        private _proxyHandler: any = null;
        private _handler: any = null;
        
        constructor(_data: any) {
            this._data = _data;
            this._proxy = _data;
        }

        get proxy() {
            return this._proxy;
        }

        //TODO: addHanlder, altrimenti l'handler viene sovrascritto!
        setHandler(parameters: any, handler: any) {
            this._parameters = parameters;
            this._handler = handler;

            this._proxyHandler = {
                set: ((target: any, prop: any, value: any) => {
                    target[prop] = value;

                    this._handler(this._parameters);
                    
                    return true;
                })
            };

            this._proxy = new Proxy(this._data, this._proxyHandler);
        }
    }
}
