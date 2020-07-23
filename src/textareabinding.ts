module SinglefinModule {
    export class TextareaBinding {

        in(container: any, element: any, data: any, key: string) {
            if(!element.is('textarea')) {
                return;
            }

            if(!key) {
                console.error("textarea binding error: variable key is undefined or null");
                
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
            
                _data[_key] = value;
            });
        }

        is(container: any, element: any, data: any, key: string) {
        }

        outAttribute(container: any, element: any, dataProxy: DataProxy, key: string, exp: string) {
            if(!element.is('textarea')) {
                return;
            }

            if(!key) {
                console.error("textarea attribute binding error: variable key is undefined or null");
                
                return;
            }

            dataProxy.addHandler({
                element: element,
                key: key,
                exp: exp,
                data: dataProxy.proxy
            }, (parameters: any) => {
                try {
                    var proxyDataObject = new ProxyDataObject();
                    var result: any = proxyDataObject.build(parameters.data, exp);

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
        }
    }
}