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

        set htmlElement(value: any) {
            this._htmlElement = value;
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
        }

        update(value: any) {
            let _value = value;

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
            
            let dataProxyHandler: DataProxyHandler = new DataProxyHandler({
                element: element,
                exp: exp,
                dataProxy: dataProxy
            }, (parameters: any) => {
                try {
                    let classes: any = Runtime.getProperty(parameters.dataProxy.data, exp);

                    for(let key in classes) {
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