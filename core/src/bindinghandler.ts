module SinglefinModule {
    export class BindingHandler {
        private _element: any;
        private _valuePath: string;
        
        constructor(element: any, valuePath: string) {
            this._element = element;
            this._valuePath = valuePath;
        }

        set(target: any, key: any, value: any, receiver: any) {
            target[key] = value;

            var propertyName = Runtime.getPropertyName(this._valuePath);

            if(propertyName == key) {
                this._element.update(value);
            }
            
            return true;
        }
    }
}