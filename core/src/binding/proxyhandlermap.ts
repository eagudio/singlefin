module SinglefinModule {
    export class ProxyHandlerMap {
        public static _map: any = {};
        public static _pageBindings: any = {};
        public static _bindMaps: any = {};

        static newProxy(proxyPath: string, object: any) {
            if(!ProxyHandlerMap.hasProxy(proxyPath)) {
                if(!ProxyHandlerMap._bindMaps[proxyPath]) {
                    ProxyHandlerMap._bindMaps[proxyPath] = {};
                }

                var handler = new ProxyHandler(proxyPath, ProxyHandlerMap._bindMaps[proxyPath]);
                var proxy = new Proxy(object, handler);

                ProxyHandlerMap._map[proxyPath] = {};
                ProxyHandlerMap._map[proxyPath].proxy = proxy;
                ProxyHandlerMap._map[proxyPath].handler = handler;
            }

            return ProxyHandlerMap._map[proxyPath];
        }

        static hasProxy(proxyPath: string) {
            return !ProxyHandlerMap._map[proxyPath] ? false : true
        }

        static getProxy(key: string) {
            return ProxyHandlerMap._map[key];
        }

        /*static emptyPageBinds(pagePath: string) {
            for(var property in ProxyHandlerMap._bindMaps) {
                for(var i=0; i<ProxyHandlerMap._bindMaps[property].length; i++) {
                    if(ProxyHandlerMap._bindMaps[property][i].pagePath == pagePath) {
                        ProxyHandlerMap._bindMaps[property].splice(i, 1);
                    }
                }
            }
        }*/

        /*
        var pageBindings = {
            "page/1": {
                "binding": {
                    "product": {
                        "text": [InputBinding, ElementBinding],
                        "code": [TextAreaBinding]
                    }
                }
            }
        }
        var list = {
            "product": {
                "text": {
                    "page/1": pageBindings["page/1"],
                    "page/2": pageBindings["page/2"]
                }
            }
        }
        */

        static registerPage(pagePath: string) {
            if(!ProxyHandlerMap._pageBindings[pagePath]) {
                ProxyHandlerMap._pageBindings[pagePath] = {};
            }

            ProxyHandlerMap._pageBindings[pagePath].binding = {};
        }

        static addElementBinding(pagePath: string, proxyPath: string, property: string, elementBinding: ElementBinding) {
            if(!ProxyHandlerMap._pageBindings[pagePath].binding[proxyPath]) {
                ProxyHandlerMap._pageBindings[pagePath].binding[proxyPath] = {};
            }

            /*console.log("BIND");
            console.log(ProxyHandlerMap._pageBindings);
            console.log(ProxyHandlerMap._bindMaps);
            console.log(pagePath);
            console.log(proxyPath);
            console.log(property);
            console.log("END BIND");*/
            if(!ProxyHandlerMap._pageBindings[pagePath].binding[proxyPath][property]) {
                ProxyHandlerMap._pageBindings[pagePath].binding[proxyPath][property] = [];
            }

            ProxyHandlerMap._pageBindings[pagePath].binding[proxyPath][property].push(elementBinding);
            
            if(!ProxyHandlerMap._bindMaps[proxyPath]) {
                ProxyHandlerMap._bindMaps[proxyPath] = {};
            }
            
            if(!ProxyHandlerMap._bindMaps[proxyPath][property]) {
                ProxyHandlerMap._bindMaps[proxyPath][property] = {};
            }
            
            if(!ProxyHandlerMap._bindMaps[proxyPath][property][pagePath]) {
                ProxyHandlerMap._bindMaps[proxyPath][property][pagePath] = ProxyHandlerMap._pageBindings[pagePath];
            }
        }

        /*static addElementBinding(valuePath: string, property: string, pagePath: string, elementBinding: ElementBinding) {
            if(!ProxyHandlerMap._bindMaps[valuePath]) {
                ProxyHandlerMap._bindMaps[valuePath] = {};
            }
            
            if(!ProxyHandlerMap._bindMaps[valuePath][property]) {
                ProxyHandlerMap._bindMaps[valuePath][property] = {};
            }
            
            if(!ProxyHandlerMap._bindMaps[valuePath][property][pagePath]) {
                ProxyHandlerMap._bindMaps[valuePath][property][pagePath] = [];
            }

            ProxyHandlerMap._bindMaps[valuePath][property][pagePath].push(elementBinding);
        }*/

        /*static addBind(property: string, pagePath: string, elementBinding: ElementBinding) {
            if(!ProxyHandlerMap._bindMaps[property]) {
                ProxyHandlerMap._bindMaps[property] = [];
            }

            var bind = {
                pagePath: pagePath,
                elementBinding: elementBinding
            }

            ProxyHandlerMap._bindMaps[property].push(bind);
        }*/
    }
}