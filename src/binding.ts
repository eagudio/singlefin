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
 
            this.in(element, dataProxy);
            this.is(element, dataProxy);
            this.outClass(element, dataProxy);
            this.outAttribute(element, dataProxy);
        }

        in(element: any, dataProxy: DataProxy) {
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
        }

        is(element: any, dataProxy: DataProxy) {
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

        outClass(element: any, dataProxy: DataProxy) {
            var children = element.find("[out-class]");

            for(var i=0; i<children.length; i++) {
                var child = $(children[i]);

                var key = child.attr("out-class");

                this.elementBinding.outClass(element, child, dataProxy, key);
            }
        }

        outAttribute(element: any, dataProxy: DataProxy) {
            if(!element) {
				return;
            }
            
            element.each((i: number, item: any) => {
				$.each(item.attributes, (i: number, attribute: any) => {
					if(attribute.specified) {
						if(!attribute.name.startsWith("out-class") && attribute.name.startsWith("out-")) {
                            var onAttribute = attribute.name.split("out-");
                            var elementAttributeName = onAttribute[1];
                            
                            this.elementBinding.outAttribute(element, element, dataProxy, elementAttributeName, attribute.value);
                            this.inputBinding.outAttribute(element, element, dataProxy, elementAttributeName, attribute.value);
                            this.textareaBinding.outAttribute(element, element, dataProxy, elementAttributeName, attribute.value);
                        }
                    }
                });
            });

            var children = element.children();

			children.each((i: number, item: any) => {
				this.outAttribute($(item), dataProxy);
			});
        }
    }
}