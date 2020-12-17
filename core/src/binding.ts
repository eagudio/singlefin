module SinglefinModule {
    export class Binding {
        private elementBinding: ElementBinding = new ElementBinding();
        private inputBinding: InputBinding = new InputBinding();
        private textareaBinding: TextareaBinding = new TextareaBinding();
        private checkboxBinding: CheckboxBinding = new CheckboxBinding();
        private radioBinding: RadioBinding = new RadioBinding();
        private selectBinding: SelectBinding = new SelectBinding();

        private _dataProxyHandlers: DataProxyHandler[] = [];
        

        //TODO: la memoria potrebbe crescere con l'aumentare dei surrogati, perchè vengono instanziati nuovi handler. Eliminare gli handler quando vengono eliminati i surrogati
        bind(page: Page, element: any, dataProxy: DataProxy, pageData: any, models: any) {
            if(!element) {
				return;
            }
            
            if(!dataProxy) {
				return;
            }
            
            dataProxy.addHandlers(page, this._dataProxyHandlers);
 
            this.in(page, element, dataProxy, pageData, models);
            this.is(element, dataProxy);
            this.outClass(page, element, dataProxy);
            this.outAttribute(page, element, dataProxy, models);
        }

        in(page: Page, element: any, dataProxy: DataProxy, pageData: any, models: any) {
            this.bindElements(page, element, dataProxy, pageData, models);

            var children = element.find("[model-value]");

            for(var i=0; i<children.length; i++) {
                var child = $(children[i]);

                this.bindElements(page, child, dataProxy, pageData, models);
            }
        }

        bindElements(page: Page, element: any, dataProxy: DataProxy, pageData: any, models: any) {
            var originalKey = element.attr("model-value");
            var key = originalKey;
            var pageModels = page.models;

            var hasModelValueEvent = element.attr("has-model-value-event");

            if(typeof hasModelValueEvent !== typeof undefined && hasModelValueEvent !== false) {
                return;
            }

            element.attr("has-model-value-event", "");

            if(pageModels) {
                if(pageModels[originalKey]) {
                    key = pageModels[originalKey].binding;
                }
            }

            if(models) {
                if(models[originalKey]) {
                    key = models[originalKey].binding;
                }
            }

            this.elementBinding.in(element, element, dataProxy.proxy, key, pageData);
            this.inputBinding.in(element, element, dataProxy.proxy, key);
            this.textareaBinding.in(element, element, dataProxy.proxy, key);
            this.checkboxBinding.in(element, element, dataProxy.proxy, key);
            this.radioBinding.in(element, element, dataProxy.proxy, key);
            this.selectBinding.in(element, element, dataProxy.proxy, key);
        }

        is(element: any, dataProxy: DataProxy) {
            var key = element.attr("is");

            this.elementBinding.is(element, element, dataProxy.proxy, key);
            this.inputBinding.is(element, element, dataProxy.proxy, key);
            this.textareaBinding.is(element, element, dataProxy.proxy, key);
            this.checkboxBinding.is(element, element, dataProxy.proxy, key);
            this.radioBinding.is(element, element, dataProxy.proxy, key);
            this.selectBinding.is(element, element, dataProxy.proxy, key);
            
            var children = element.find("[is]");

            for(var i=0; i<children.length; i++) {
                var child = $(children[i]);

                var key = child.attr("is");

                this.elementBinding.is(element, child, dataProxy.proxy, key);
                this.inputBinding.is(element, child, dataProxy.proxy, key);
                this.textareaBinding.is(element, child, dataProxy.proxy, key);
                this.checkboxBinding.is(element, child, dataProxy.proxy, key);
                this.radioBinding.is(element, child, dataProxy.proxy, key);
                this.selectBinding.is(element, child, dataProxy.proxy, key);
            }
        }

        outClass(page: Page, element: any, dataProxy: DataProxy) {
            var key = element.attr("model-class");
            
            this.elementBinding.outClass(this._dataProxyHandlers, page, element, element, dataProxy, key);
            
            var children = element.find("[model-class]");

            for(var i=0; i<children.length; i++) {
                var child = $(children[i]);

                var key = child.attr("model-class");

                this.elementBinding.outClass(this._dataProxyHandlers, page, element, child, dataProxy, key);
            }
        }

        outAttribute(page: Page, element: any, dataProxy: DataProxy, models: any) {
            if(!element) {
				return;
            }

            var pageModels = page.models;
            
            element.each((i: number, item: any) => {
				$.each(item.attributes, (i: number, attribute: any) => {
					if(attribute.specified) {
						if(!attribute.name.startsWith("model-class") && attribute.name.startsWith("model-")) {
                            var onAttribute = attribute.name.split("model-");
                            var elementAttributeName = onAttribute[1];
                            var originalValue = attribute.value;
                            var value = originalValue;

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

            var children = element.children();

			children.each((i: number, item: any) => {
				this.outAttribute(page, $(item), dataProxy, models);
			});
        }
    }
}