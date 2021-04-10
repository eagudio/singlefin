module SinglefinModule {
    export class ProxyHandler {
        private _proxyPath: string;
        private _bindMaps: any;
        private _disabled: boolean = false;

        constructor(proxyPath: string, bindMaps: any) {
            this._proxyPath = proxyPath;
            this._bindMaps = bindMaps;
        }

        enable() {
            this._disabled = false;
        }

        disable() {
            this._disabled = true;
        }

        set(target: any, key: any, value: any, receiver: any) {
            target[key] = value;

            if(this._disabled) {
                return true;
            }
            
            for(let pagePath in this._bindMaps[key]) {
                let elementBindings = this._bindMaps[key][pagePath].binding[this._proxyPath][key];

                for(let i=0; i<elementBindings.length; i++) {
                    elementBindings[i].update(value);
                }
            }
            
            return true;
        }
    }
}