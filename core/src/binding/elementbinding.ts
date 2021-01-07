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
            
                console.log("element watch");
                console.log(_valuePath);
                console.log(data);
                console.log(_pageData);
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
            console.log("element update");
            console.log(value);
            this.htmlElement.attr(this.attribute, value);
        }

        /*outClass(dataProxyHandlers: DataProxyHandler[], page: Page, container: any, element: any, dataProxy: DataProxy, exp: string) {
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
        }*/
    }
}