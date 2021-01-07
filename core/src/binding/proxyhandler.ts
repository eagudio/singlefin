module SinglefinModule {
    export class ProxyHandler {
        private _proxyPath: string;
        private _bindMaps: any;

        constructor(proxyPath: string, bindMaps: any) {
            this._proxyPath = proxyPath;
            this._bindMaps = bindMaps;
        }

        set(target: any, key: any, value: any, receiver: any) {
            target[key] = value;
            
            for(var pagePath in this._bindMaps[key]) {
                var elementBindings = this._bindMaps[key][pagePath].binding[this._proxyPath][key];

                for(var i=0; i<elementBindings.length; i++) {
                    elementBindings[i].update(value);
                }
            }
            
            return true;
        }
    }
}