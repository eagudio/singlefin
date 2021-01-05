module SinglefinModule {
    export class TextareaBinding extends ElementBinding {
        watch(singlefin: Singlefin, page: Page, model: any, valuePath: string, data: any, pageData: any) {
            this.htmlElement.on("change paste keyup", {
                singlefin: singlefin,
                page: page,
                data: data,
                valuePath: valuePath,
                model: model
            }, (event: any) => {
                var _singlefin = event.data.singlefin;
                var _page = event.data.page;
                var _valuePath = event.data.valuePath;
                var _model = event.data.model;
                var _data = event.data.data;

                var inputElement = $(event.currentTarget);
                var value = inputElement.val();
            
                Runtime.setProperty(_valuePath, _data, value);
                
                if(!_model) {
                    return;
                }

                if(!_model.on) {
                    return;
                }

                _page.handleEvent(_singlefin, _model, "on", _page, value, event);
            });
        }

        update(value: any) {
            if(this.attribute == "value") {
                this.htmlElement.val(value);
            }
            else {
                this.htmlElement.attr(this.attribute, value);
            }
        }


        /*in(container: any, element: any, data: any, key: string) {
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
            
                Runtime.setProperty(_key, _data, value);
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
        }*/
    }
}