module SinglefinModule {
    export class DataProxy {
        private _data: any;
        private _proxy: any = null;
        private _proxyHandler: any = null;
        private _dataProxyHandlers: any = {};
        
        constructor(_data: any) {
            this._data = _data;
            this._proxy = _data;

            this._proxyHandler = {
                get(target: any, key: any) {
                    if (typeof target[key] === 'object' && target[key] !== null) {
                        return new Proxy(target[key], this._proxyHandler)
                    }

                    return target[key];
                },
                set: ((target: any, key: any, value: any) => {
                    target[key] = value;

                    for(var dataProxyHandlerKey in this._dataProxyHandlers) {
                        var dataProxyHandlers: DataProxyHandler[] = this._dataProxyHandlers[dataProxyHandlerKey];

                        for(var i=0; i<dataProxyHandlers.length; i++) {
                            dataProxyHandlers[i].handler(dataProxyHandlers[i].parameters);
                        }
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

        addHandlers(page: Page, dataProxyHandlers: DataProxyHandler[]) {
            this._dataProxyHandlers[page.path] = dataProxyHandlers;
        }
    }
}
