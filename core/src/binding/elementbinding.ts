module SinglefinModule {
    export class ElementBinding {
        private _htmlElement: any;
        private _attribute: string;

        constructor(htmlElement: any, attribute: string) {
            this._htmlElement = htmlElement;
            this._attribute = attribute;
        }

        get htmlElement() {
            return this._htmlElement;
        }

        get attribute() {
            return this._attribute;
        }

        watch(singlefin: Singlefin, page: Page, model: any, valuePath: string, data: any, pageData: any) {
            this.htmlElement.on("click", {
                singlefin: singlefin,
                page: page,
                data: data,
                pageData: pageData,
                valuePath: valuePath,
                model: model
            }, (event: any) => {
                var _singlefin = event.data.singlefin;
                var _page = event.data.page;
                var _valuePath = event.data.valuePath;
                var _model = event.data.model;
                var _data = event.data.data;
                var _pageData = event.data.pageData;
            
                Runtime.setProperty(_valuePath, _data, _pageData);
                
                if(!_model) {
                    return;
                }

                if(!_model.on) {
                    return;
                }

                _page.handleEvent(_singlefin, _model, "on", _page, _pageData, event);
            });
        }

        update(value: any) {
            this.htmlElement.attr(this.attribute, value);
        }

        /*in(container: any, element: any, data: any, key: string, pageData: any) {
            if(element.is('textarea') || element.is('input') || element.is('select')) {
                return;
            }

            if(!key) {
                return;
            }

            element.on("click", {
                data: data,
                key: key,
                pageData: pageData
            }, (event: any) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var _pageData = event.data.pageData;
                //var inputElement = $(event.currentTarget);
                //var value = inputElement.attr("value");
            
                //Runtime.setProperty(_key, _data, value);

                Runtime.setProperty(_key, _data, _pageData);
            });
        }

        is(container: any, element: any, data: any, key: string) {
        }

        outClass(dataProxyHandlers: DataProxyHandler[], page: Page, container: any, element: any, dataProxy: DataProxy, exp: string) {
            if(!exp) {
                return;
            }
            
            var dataProxyHandler: DataProxyHandler = new DataProxyHandler({
                element: element,
                exp: exp,
                dataProxy: dataProxy
            }, (parameters: any) => {
                try {
                    var classes: any = Runtime.getProperty(parameters.dataProxy.data, exp);

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

            if(!exp) {
                return;
            }

            var dataProxyHandler: DataProxyHandler = new DataProxyHandler({
                element: element,
                key: key,
                exp: exp,
                dataProxy: dataProxy
            }, (parameters: any) => {
                try {
                    var result: any = Runtime.getProperty(parameters.dataProxy.data, exp);

                    parameters.element.attr(parameters.key, result);
                }
                catch(ex) {
                    console.error("element attribute binding error: " + ex);
                }
            });

            dataProxyHandlers.push(dataProxyHandler);
        }*/
    }
}