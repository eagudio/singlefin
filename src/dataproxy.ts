module SinglefinModule {
    export class DataProxy {
        private _data: any;
        private _proxy: any = null;
        private _proxyHandler: any = null;
        private _dataProxyHandlers: DataProxyHandler[] = [];
        
        constructor(_data: any) {
            this._data = _data;
            this._proxy = _data;

            this._proxyHandler = {
                set: ((target: any, prop: any, value: any) => {
                    target[prop] = value;

                    for(var i=0; i<this._dataProxyHandlers.length; i++) {
                        var dataProxyHandler: DataProxyHandler = this._dataProxyHandlers[i];

                        dataProxyHandler.handler(dataProxyHandler.parameters);
                    }
                    
                    return true;
                })
            };

            if(this._data != null && typeof this._data == "object") {
                this._proxy = new Proxy(this._data, this._proxyHandler);
            }
        }

        get proxy() {
            return this._proxy;
        }

        addHandler(parameters: any, handler: any) {
            var dataProxyHandler: DataProxyHandler = new DataProxyHandler(parameters, handler);
            
            this._dataProxyHandlers.push(dataProxyHandler);
        }
    }
}
