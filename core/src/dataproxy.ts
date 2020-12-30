module SinglefinModule {
    export class DataProxy {
        private static _dataProxyHandlers: any = {};

        private _data: any;
        private _proxy: any = null;
        
        
        constructor(_data: any) {
            this._data = _data;
            this._proxy = _data;

            if(this._data != null && typeof this._data == "object") {
                //this._proxy = new Proxy(this._data, DataProxy.newProxyHandler());
            }
        }

        get proxy() {
            return this._proxy;
        }

        get data() {
            return this._data;
        }

        addHandlers(page: Page, dataProxyHandlers: DataProxyHandler[]) {
            DataProxy._dataProxyHandlers[page.path] = dataProxyHandlers;
        }

        static newProxyHandler() {
            //return new BindingHandler(null);
            /*return {
                get: (target: any, key: any): any => {
                    //WORK-AROUND: for Date object...
                    if(target[key] && typeof target[key].getMonth === 'function') {
                        return target[key];
                    }

                    if (typeof target[key] === 'object' && target[key] !== null) {
                        return new Proxy(target[key], DataProxy.newProxyHandler())
                    }

                    return target[key];
                },
                set: (target: any, key: any, value: any) => {
                    target[key] = value;

                    for(var dataProxyHandlerKey in DataProxy._dataProxyHandlers) {
                        var dataProxyHandlers: DataProxyHandler[] = DataProxy._dataProxyHandlers[dataProxyHandlerKey];

                        for(var i=0; i<dataProxyHandlers.length; i++) {
                            console.log(key);
                            console.log(dataProxyHandlers[i].handler);
                            dataProxyHandlers[i].handler(dataProxyHandlers[i].parameters);
                        }
                    }
                    
                    return true;
                }
            };*/
        }
    }
}
