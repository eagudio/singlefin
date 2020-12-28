module SinglefinModule {
    export class InputBinding {

        in(singlefin: Singlefin, page: Page, model: any, container: any, element: any, data: any, key: string) {
            if(!element.is('input')) {
                return;
            }

            if(!key) {
                return;
            }

            element.on("change paste keyup", {
                page: page,
                data: data,
                key: key,
                model: model
            }, (event: any) => {
                var _page = event.data.page;
                var _data = event.data.data;
                var _key = event.data.key;
                var _model = event.data.model;
                var inputElement = $(event.currentTarget);
                var value = inputElement.val();
            
                Runtime.setProperty(_key, _data, value);
                
                if(!_model) {
                    return;
                }

                if(!_model.on) {
                    return;
                }
                
                page.handleEvent(singlefin, _model, "on", _page, value, event);
            });
        }

        is(container: any, element: any, data: any, key: string) {
        }

        outAttribute(dataProxyHandlers: DataProxyHandler[], page: Page, container: any, element: any, dataProxy: DataProxy, key: string, exp: string) {
            if(!element.is('input')) {
                return;
            }

            if(!key) {
                return;
            }

            if(!exp) {
                return;
            }

            var result: any = Runtime.getProperty(dataProxy.data, exp);

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
                    var result: any = Runtime.getProperty(parameters.dataProxy.data, exp);

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