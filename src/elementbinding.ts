module SinglefinModule {
    export class ElementBinding {

        in(container: any, element: any, data: any, key: string) {
            if(element.is('textarea') || element.is('input') || element.is('select')) {
                return;
            }

            if(!key) {
                console.error("textarea binding error: variable key is undefined or null");
                
                return;
            }

            element.on("click", {
                data: data,
                key: key
            }, (event: any) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var inputElement = $(event.currentTarget);
                var value = inputElement.attr("value");
            
                _data[_key] = value;
            });
        }

        is(container: any, element: any, data: any, key: string) {
        }
    }
}