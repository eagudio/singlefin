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

        static registerPage(pagePath: string) {
            ProxyHandlerMap._pageBindings[pagePath] = {};

            ProxyHandlerMap._pageBindings[pagePath].binding = {};
        }

        static addElementBinding(pagePath: string, proxyPath: string, property: string, elementBinding: ElementBinding) {
            if(!ProxyHandlerMap._pageBindings[pagePath].binding[proxyPath]) {
                ProxyHandlerMap._pageBindings[pagePath].binding[proxyPath] = {};
            }

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
    }
}