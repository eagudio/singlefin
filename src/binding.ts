module SinglefinModule {
    export class Binding {
        private elementBinding: ElementBinding = new ElementBinding();
        private inputBinding: InputBinding = new InputBinding();
        private textareaBinding: TextareaBinding = new TextareaBinding();
        private checkboxBinding: CheckboxBinding = new CheckboxBinding();
        private radioBinding: RadioBinding = new RadioBinding();
        private selectBinding: SelectBinding = new SelectBinding();

        bind(element: any, data: any) {
            if(!element) {
				return;
			}
            
            var children = element.find("[in]");

            for(var i=0; i<children.length; i++) {
                var child = $(children[i]);

                var key = child.attr("in");

                this.elementBinding.in(element, child, data, key);
                this.inputBinding.in(element, child, data, key);
                this.textareaBinding.in(element, child, data, key);
                this.checkboxBinding.in(element, child, data, key);
                this.radioBinding.in(element, child, data, key);
                this.selectBinding.in(element, child, data, key);
            }

            var children = element.find("[is]");

            for(var i=0; i<children.length; i++) {
                var child = $(children[i]);

                var key = child.attr("is");

                this.elementBinding.is(element, child, data, key);
                this.inputBinding.is(element, child, data, key);
                this.textareaBinding.is(element, child, data, key);
                this.checkboxBinding.is(element, child, data, key);
                this.radioBinding.is(element, child, data, key);
                this.selectBinding.is(element, child, data, key);
            }
        }
    }
}