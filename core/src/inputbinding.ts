module SinglefinModule {
    export class InputBinding {
        private _htmlElement: any;
        private _attribute: string;

        constructor(htmlElement: any, attribute: string) {
            this._htmlElement = htmlElement;
            this._attribute = attribute;
        }

        watch(singlefin: Singlefin, page: Page, model: any, valuePath: string, data: any) {
            this._htmlElement.on("change paste keyup", {
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
                console.log("watch...");
                console.log(_valuePath);
                console.log(inputElement);
                console.log("watch!");

                _page.handleEvent(_singlefin, _model, "on", _page, value, event);
            });
        }

        update(value: any) {
            console.log("update...");
            console.log(this._htmlElement);
            console.log("update!");

            if(this._attribute == "value") {
                this._htmlElement.val(value);
            }
            else {
                this._htmlElement.attr(this._attribute, value);
            }
        }
    }
}




/*module SinglefinModule {
    export class InputBinding {

        in(singlefin: Singlefin, page: Page, model: any, container: any, element: any, dataProxy: DataProxy, key: string) {
            if(!element.is('input')) {
                return;
            }

            if(!key) {
                return;
            }

            element.on("change paste keyup", {
                page: page,
                dataProxy: dataProxy,
                key: key,
                model: model
            }, (event: any) => {
                var _page = event.data.page;
                var _dataProxy: DataProxy = event.data.dataProxy;
                var _key = event.data.key;
                var _model = event.data.model;
                var inputElement = $(event.currentTarget);
                var value = inputElement.val();
            
                Runtime.setProperty(_key, _dataProxy.data, value);
                
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
                    console.log("out!!");
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
}*/