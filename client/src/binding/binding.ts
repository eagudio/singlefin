module SinglefinModule {
    export class Binding {
        bind(singlefin: Singlefin, page: Page, element: any, pageData: any, models: any) {
            if(!element) {
				return;
            }

            ProxyHandlerMap.registerPage(page.path);
            
            this.bindPageElements(singlefin, page, element, models, pageData);
        }

        bindPageElements(singlefin: Singlefin, page: Page, element: any, models: any, pageData: any) {
            if(!element) {
				return;
            }

            let pageModels = page.models;
            
            element.each((i: number, item: any) => {
				$.each(item.attributes, (i: number, attribute: any) => {
					if(attribute.specified) {
						if(!attribute.name.startsWith("model-class") && attribute.name.startsWith("model")) {
                            let elementAttributeName = null;

                            if(attribute.name.startsWith("model-")) {
                                let onAttribute = attribute.name.split("model-");
                                elementAttributeName = onAttribute[1];
                            }
                            
                            let originalValuePath = attribute.value;
                            let valuePath = originalValuePath;
                            let model = null;
                            let modelProperty = null;

                            if(pageModels) {
                                if(pageModels[originalValuePath]) {
                                    valuePath = pageModels[originalValuePath].ref;
                                    model = pageModels[originalValuePath];
                                    modelProperty = pageModels[originalValuePath].property;
                                }
                            }
                
                            if(models) {
                                if(models[originalValuePath]) {
                                    valuePath = models[originalValuePath].ref;
                                    model = models[originalValuePath];
                                    modelProperty = models[originalValuePath].property;
                                }
                            }

                            if(valuePath) {
                                valuePath = valuePath.replace(".$", "[" + page.index + "]");

                                let elementBinding: ElementBinding = this.makeBinding($(item), elementAttributeName, modelProperty);
                
                                elementBinding.watch(singlefin, page, model, valuePath, singlefin.models, pageData);

                                let proxyPath = Runtime.getParentPath(valuePath);
                                let object = Runtime.getParentInstance(singlefin.models, valuePath);
                                let property = Runtime.getPropertyName(valuePath);

                                let proxyHandler = ProxyHandlerMap.newProxy(proxyPath, object);
                                ProxyHandlerMap.addElementBinding(page.path, proxyPath, property, elementBinding);
                                
                                let value: any = Runtime.getProperty(singlefin.models, valuePath);

                                Runtime.setProperty(proxyPath, singlefin.models, proxyHandler.proxy);
                                
                                elementBinding.init(value);
                            }
                        }
                    }
                });
            });

            let children = element.children();

			children.each((i: number, item: any) => {
				this.bindPageElements(singlefin, page, $(item), models, pageData);
			});
        }

        makeBinding(element: any, attributeName: string, property: string): ElementBinding {
            if(element.is('input')) {
                if(element.attr("type") == "file") {
                    return new InputFileBinding(element, attributeName, property);
                }
                else {
                    return new InputBinding(element, attributeName, property);
                }
            }
            else if(element.is('textarea')) {
                return new TextareaBinding(element, attributeName, property);
            }
            else if(element.is('select')) {
                return new SelectBinding(element, attributeName, property);
            }
            else if(attributeName == "hide") {
                return new HideBinding(element, attributeName, property);
            }
            else if(attributeName == "show") {
                return new ShowBinding(element, attributeName, property);
            }

            return new ElementBinding(element, attributeName, property);
        }
    }
}





/*module SinglefinModule {
    export class Binding {
        private elementBinding: ElementBinding = new ElementBinding();
        private inputBinding: InputBinding = new InputBinding();
        private textareaBinding: TextareaBinding = new TextareaBinding();
        private checkboxBinding: CheckboxBinding = new CheckboxBinding();
        private radioBinding: RadioBinding = new RadioBinding();
        private selectBinding: SelectBinding = new SelectBinding();

        private _dataProxyHandlers: DataProxyHandler[] = [];
        

        bind(singlefin: Singlefin, page: Page, element: any, pageData: any, models: any) {
            if(!element) {
				return;
            }

            let dataProxy: DataProxy = singlefin.modelProxy;
            
            if(!dataProxy) {
				return;
            }
            
            dataProxy.addHandlers(page, this._dataProxyHandlers);
 
            this.in(singlefin, page, element, dataProxy, pageData, models);
            this.is(element, dataProxy);
            this.outClass(page, element, dataProxy);
            this.outAttribute(page, element, dataProxy, models);
        }

        in(singlefin: Singlefin, page: Page, element: any, dataProxy: DataProxy, pageData: any, models: any) {
            this.bindElements(singlefin, page, element, dataProxy, pageData, models);

            let children = element.find("[model-value]");

            for(let i=0; i<children.length; i++) {
                let child = $(children[i]);

                this.bindElements(singlefin, page, child, dataProxy, pageData, models);
            }
        }

        bindElements(singlefin: Singlefin, page: Page, element: any, dataProxy: DataProxy, pageData: any, models: any) {
            let modelKey = element.attr("model-value");
            let key = modelKey;
            let pageModels = page.models;
            let model = null;

            let hasModelValueEvent = element.attr("has-model-value-event");

            if(typeof hasModelValueEvent !== typeof undefined && hasModelValueEvent !== false) {
                return;
            }

            element.attr("has-model-value-event", "");

            if(pageModels) {
                if(pageModels[modelKey]) {
                    key = pageModels[modelKey].binding;
                    model = pageModels[modelKey];
                }
            }

            if(models) {
                if(models[modelKey]) {
                    key = models[modelKey].binding;
                    model = models[modelKey];
                }
            }

            this.elementBinding.in(element, element, dataProxy.proxy, key, pageData);
            this.inputBinding.in(singlefin, page, model, element, element, dataProxy, key);
            this.textareaBinding.in(element, element, dataProxy.proxy, key);
            this.checkboxBinding.in(element, element, dataProxy.proxy, key);
            this.radioBinding.in(element, element, dataProxy.proxy, key);
            this.selectBinding.in(element, element, dataProxy.proxy, key);
        }

        is(element: any, dataProxy: DataProxy) {
            let key = element.attr("is");

            this.elementBinding.is(element, element, dataProxy.proxy, key);
            this.inputBinding.is(element, element, dataProxy.proxy, key);
            this.textareaBinding.is(element, element, dataProxy.proxy, key);
            this.checkboxBinding.is(element, element, dataProxy.proxy, key);
            this.radioBinding.is(element, element, dataProxy.proxy, key);
            this.selectBinding.is(element, element, dataProxy.proxy, key);
            
            let children = element.find("[is]");

            for(let i=0; i<children.length; i++) {
                let child = $(children[i]);

                let key = child.attr("is");

                this.elementBinding.is(element, child, dataProxy.proxy, key);
                this.inputBinding.is(element, child, dataProxy.proxy, key);
                this.textareaBinding.is(element, child, dataProxy.proxy, key);
                this.checkboxBinding.is(element, child, dataProxy.proxy, key);
                this.radioBinding.is(element, child, dataProxy.proxy, key);
                this.selectBinding.is(element, child, dataProxy.proxy, key);
            }
        }

        outClass(page: Page, element: any, dataProxy: DataProxy) {
            let key = element.attr("model-class");
            
            this.elementBinding.outClass(this._dataProxyHandlers, page, element, element, dataProxy, key);
            
            let children = element.find("[model-class]");

            for(let i=0; i<children.length; i++) {
                let child = $(children[i]);

                let key = child.attr("model-class");

                this.elementBinding.outClass(this._dataProxyHandlers, page, element, child, dataProxy, key);
            }
        }

        outAttribute(page: Page, element: any, dataProxy: DataProxy, models: any) {
            if(!element) {
				return;
            }

            let pageModels = page.models;
            
            element.each((i: number, item: any) => {
				$.each(item.attributes, (i: number, attribute: any) => {
					if(attribute.specified) {
						if(!attribute.name.startsWith("model-class") && attribute.name.startsWith("model-")) {
                            let onAttribute = attribute.name.split("model-");
                            let elementAttributeName = onAttribute[1];
                            let originalValue = attribute.value;
                            let value = originalValue;

                            if(pageModels) {
                                if(pageModels[originalValue]) {
                                    value = pageModels[originalValue].binding;
                                }
                            }
                
                            if(models) {
                                if(models[originalValue]) {
                                    value = models[originalValue].binding;
                                }
                            }
                            
                            this.elementBinding.outAttribute(this._dataProxyHandlers, page, element, element, dataProxy, elementAttributeName, value);
                            this.inputBinding.outAttribute(this._dataProxyHandlers, page, element, element, dataProxy, elementAttributeName, value);
                            this.textareaBinding.outAttribute(this._dataProxyHandlers, page, element, element, dataProxy, elementAttributeName, value);
                            this.selectBinding.outAttribute(this._dataProxyHandlers, page, element, element, dataProxy, elementAttributeName, value);
                        }
                    }
                });
            });

            let children = element.children();

			children.each((i: number, item: any) => {
				this.outAttribute(page, $(item), dataProxy, models);
			});
        }
    }
}*/