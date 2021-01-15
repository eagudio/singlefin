module SinglefinModule {
    export class ElementBinding {
        private _htmlElement: any;
        private _attribute: string;
        private _property: string;

        constructor(htmlElement: any, attribute: string, property: any) {
            this._htmlElement = htmlElement;
            this._attribute = attribute;
            this._property = property;
        }

        get htmlElement() {
            return this._htmlElement;
        }

        get attribute() {
            return this._attribute;
        }

        init(value: any) {
            this.update(value);
        }

        watch(singlefin: Singlefin, page: Page, model: any, valuePath: string, data: any, pageData: any) {
            if(this.attribute == "content") {
                return;
            }
            
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
            var _value = value;

            if(this._property) {
                _value = Runtime.getProperty(value, this._property);
            }
            
            if(this.attribute == "value" || this.attribute == "content") {
                this.htmlElement.html(_value);
            }
            else if(this.attribute) {
                this.htmlElement.attr(this.attribute, _value);
            }
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