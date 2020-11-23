module SinglefinModule {
    export class TextareaBinding {

        in(container: any, element: any, data: any, key: string) {
            if(!element.is('textarea')) {
                return;
            }

            if(!key) {
                return;
            }

            element.on("change paste keyup", {
                data: data,
                key: key
            }, (event: any) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var inputElement = $(event.currentTarget);
                var value = inputElement.val();
            
                ProxyDataObject.setValue(_key, _data, value);
            });
        }

        is(container: any, element: any, data: any, key: string) {
        }

        outAttribute(dataProxyHandlers: DataProxyHandler[], page: Page, container: any, element: any, dataProxy: DataProxy, key: string, exp: string) {
            if(!element.is('textarea')) {
                return;
            }

            if(!key) {
                return;
            }

            if(!exp) {
                return;
            }

            var result: any = ProxyDataObject.getValue(dataProxy.data, exp);

            if(key == "value") {
                element.val(result);
            }
            else {
                element.attr(key, result);
            }

            var dataProxyHandler: DataProxyHandler = new DataProxyHandler({
                element: element,
                key: key,
                exp: exp,
                dataProxy: dataProxy
            }, (parameters: any) => {
                try {
                    var result: any = ProxyDataObject.getValue(parameters.dataProxy.data, exp);

                    if(parameters.key == "value") {
                        parameters.element.val(result);
                    }
                    else {
                        parameters.element.attr(parameters.key, result);
                    }
                }
                catch(ex) {
                    console.error("element attribute binding error: " + ex);
                }
            });

            dataProxyHandlers.push(dataProxyHandler);
        }
    }
}