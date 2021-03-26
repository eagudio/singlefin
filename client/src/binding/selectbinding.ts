module SinglefinModule {
    export class SelectBinding extends ElementBinding {
        init(value: any) {
            this.update(value);
        }
        
        watch(singlefin: Singlefin, page: Page, model: any, valuePath: string, data: any, pageData: any) {
            this.htmlElement.on("change", {
                singlefin: singlefin,
                page: page,
                data: data,
                valuePath: valuePath,
                model: model
            }, (event: any) => {
                var _singlefin = event.data.singlefin;
                var _page: Page = event.data.page;
                var _valuePath = event.data.valuePath;
                var _model = event.data.model;
                var _data = event.data.data;

                var inputElement = $(event.currentTarget);
                var value = inputElement.val();

                if(value === "null") {
                    value = null;
                }
            
                Runtime.setProperty(_valuePath, _data, value);
                
                if(!_model) {
                    return;
                }

                if(!_model.on) {
                    return;
                }

                _page.eventManager.handleEvent(_singlefin, _model, "on", _page, value, event);
            });

            this.htmlElement.on("singlefin:show", {
                elementBinding: this,
                data: data,
                valuePath: valuePath
            }, (event: any) => {
                var value: any = Runtime.getProperty(event.data.data, event.data.valuePath);

                event.data.elementBinding.update(value);
            });
        }

        update(value: any) {
            if(this.attribute == "value") {
                this.htmlElement.val(String(value));
            }
            else {
                this.htmlElement.attr(this.attribute, String(value));
            }
        }

        /*in(container: any, element: any, data: any, key: string) {            
            if(!element.is('select')) {
                return;
            }

            if(!key) {
                return;
            }

            //ProxyDataObject.setValue(key, data, element.val());

            element.on("change", {
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

        outAttribute(dataProxyHandlers: DataProxyHandler[], page: Page, container: any, element: any, dataProxy: DataProxy, key: string, exp: string) {
            if(!element.is('select')) {
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

        is(container: any, element: any, data: any, key: string) {
        }*/
    }
}