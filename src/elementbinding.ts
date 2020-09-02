module SinglefinModule {
    export class ElementBinding {

        in(container: any, element: any, data: any, key: string) {
            if(element.is('textarea') || element.is('input') || element.is('select')) {
                return;
            }

            if(!key) {
                return;
            }

            element.on("click", {
                data: data,
                key: key
            }, (event: any) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var inputElement = $(event.currentTarget);
                var value = inputElement.attr("value");
            
                _data[_key] = value;
            });
        }

        is(container: any, element: any, data: any, key: string) {
        }

        outClass(dataProxyHandlers: DataProxyHandler[], page: Page, container: any, element: any, dataProxy: DataProxy, exp: string) {
            var dataProxyHandler: DataProxyHandler = new DataProxyHandler({
                element: element,
                exp: exp,
                data: dataProxy.proxy
            }, (parameters: any) => {
                try {
                    var proxyDataObject = new ProxyDataObject();
                    var classes: any = proxyDataObject.build(parameters.data, exp);

                    for(var key in classes) {
                        if(classes[key] == true) {
                            parameters.element.addClass(key);
                        }
                        else {
                            parameters.element.removeClass(key);
                        }
                    }
                }
                catch(ex) {
                    console.error("element class binding error: " + ex);
                }
            });

            dataProxyHandlers.push(dataProxyHandler);
        }

        outAttribute(dataProxyHandlers: DataProxyHandler[], page: Page, container: any, element: any, dataProxy: DataProxy, key: string, exp: string) {
            if(element.is('textarea') || element.is('input') || element.is('select')) {
                return;
            }

            if(!key) {
                return;
            }

            var dataProxyHandler: DataProxyHandler = new DataProxyHandler({
                element: element,
                key: key,
                exp: exp,
                data: dataProxy.proxy
            }, (parameters: any) => {
                try {
                    var proxyDataObject = new ProxyDataObject();
                    var result: any = proxyDataObject.build(parameters.data, exp);

                    parameters.element.attr(parameters.key, result);
                }
                catch(ex) {
                    console.error("element attribute binding error: " + ex);
                }
            });

            dataProxyHandlers.push(dataProxyHandler);
        }
    }
}