module SinglefinModule {
    export class Binding {
        private elementBinding: ElementBinding = new ElementBinding();
        private inputBinding: InputBinding = new InputBinding();
        private textareaBinding: TextareaBinding = new TextareaBinding();
        private checkboxBinding: CheckboxBinding = new CheckboxBinding();
        private radioBinding: RadioBinding = new RadioBinding();
        private selectBinding: SelectBinding = new SelectBinding();

        bind(element: any, dataProxy: DataProxy) {
            if(!element) {
				return;
			}
            
            var children = element.find("[in]");

            for(var i=0; i<children.length; i++) {
                var child = $(children[i]);

                var key = child.attr("in");

                this.elementBinding.in(element, child, dataProxy.proxy, key);
                this.inputBinding.in(element, child, dataProxy.proxy, key);
                this.textareaBinding.in(element, child, dataProxy.proxy, key);
                this.checkboxBinding.in(element, child, dataProxy.proxy, key);
                this.radioBinding.in(element, child, dataProxy.proxy, key);
                this.selectBinding.in(element, child, dataProxy.proxy, key);
            }

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

            var children = element.find("[out-class]");

            for(var i=0; i<children.length; i++) {
                var child = $(children[i]);

                var key = child.attr("out-class");

                this.elementBinding.outClass(element, child, dataProxy, key);
            }

            this.findAttributeByNameStartWith(element, "out-attribute-", ((child: any, attributeName: string, attributeValue: string) => {
                this.elementBinding.outAttribute(element, child, dataProxy, attributeName, attributeValue);
            }));
        }

        findAttributeByNameStartWith(element: any, attributeName: string, action: any) {
            if(!element) {
				return;
            }
            
            element.each((i: number, item: any) => {
				$.each(item.attributes, (i: number, attribute: any) => {
					if(attribute.specified) {
						if(attribute.name.startsWith(attributeName)) {
                            var onAttribute = attribute.name.split(attributeName);
                            var elementAttributeName = onAttribute[1];
                            
                            action(element, elementAttributeName, attribute.value);
                        }
                    }
                });
            });

            var children = element.children();

			children.each((i: number, item: any) => {
				this.findAttributeByNameStartWith($(item), attributeName, action);
			});
        }
    }
}