module SinglefinModule {
    export class BindingFactory {
        static makeBinding(element: any) {
            if(element.is('input')) {
                return new InputBinding();
            }
            else if(element.is('textarea')) {
                return new TextareaBinding();
            }
            else if(element.is(':checkbox')) {
                return new CheckboxBinding();
            }
            else if(element.is(':radio')) {
                return new RadioBinding();
            }
            else if(element.is('select')) {
                return new SelectBinding();
            }
            else {
                return new ElementBinding();
            }
        }
    }
}