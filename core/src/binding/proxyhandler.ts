module SinglefinModule {
    export class ProxyHandler {
        private _proxyPath: string;
        private _bindMaps: any;

        constructor(proxyPath: string, bindMaps: any) {
            this._proxyPath = proxyPath;
            this._bindMaps = bindMaps;
        }

        /*emptyPageBinds(pagePath: string) {
            for(var property in this._bindMaps) {
                for(var i=0; i<this._bindMaps[property].length; i++) {
                    if(this._bindMaps[property][i].pagePath == pagePath) {
                        this._bindMaps[property].splice(i, 1);
                    }
                }
            }
        }

        addBind(property: string, pagePath: string, elementBinding: ElementBinding) {
            if(!this._bindMaps[property]) {
                this._bindMaps[property] = [];
            }

            var bind = {
                pagePath: pagePath,
                elementBinding: elementBinding
            }

            this._bindMaps[property].push(bind);
        }*/

        set(target: any, key: any, value: any, receiver: any) {
            target[key] = value;
            
            console.log(this._bindMaps);
            console.log(this._bindMaps[key]);
            for(var pagePath in this._bindMaps[key]) {
                var elementBindings = this._bindMaps[key][pagePath].binding[this._proxyPath][key];

                for(var i=0; i<elementBindings.length; i++) {
                    elementBindings[i].update(value);
                }
            }




            /*var bind = this._bindMaps[key];

            if(!bind) {
                return true;
            }

            for(var i=0; i<bind.length; i++) {
                bind[i].elementBinding.update(value);
            }*/
            
            return true;
        }
    }
}