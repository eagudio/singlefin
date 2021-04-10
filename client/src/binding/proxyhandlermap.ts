module SinglefinModule {
    export class ProxyHandlerMap {
        public static _map: any = {};
        public static _pageBindings: any = {};
        public static _bindMaps: any = {};

        static newProxy(proxyPath: string, object: any, force?: boolean) {
            if(!ProxyHandlerMap.hasProxy(proxyPath) || force == true) {
                if(!ProxyHandlerMap._bindMaps[proxyPath]) {
                    ProxyHandlerMap._bindMaps[proxyPath] = {};
                }

                let handler = new ProxyHandler(proxyPath, ProxyHandlerMap._bindMaps[proxyPath]);
                let proxy = new Proxy(object, handler);

                ProxyHandlerMap._map[proxyPath] = {};
                ProxyHandlerMap._map[proxyPath].proxy = proxy;
                ProxyHandlerMap._map[proxyPath].handler = handler;
            }

            return ProxyHandlerMap._map[proxyPath];
        }

        static deleteProxyStartWith(proxyPath: string) {
            for(let key in ProxyHandlerMap._map) {
                if(key.startsWith(proxyPath)) {
                    ProxyHandlerMap._map[key] = null;
                }
            }
        }

        static hasProxy(proxyPath: string) {
            return !ProxyHandlerMap._map[proxyPath] ? false : true
        }

        static getProxy(key: string) {
            return ProxyHandlerMap._map[key];
        }

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