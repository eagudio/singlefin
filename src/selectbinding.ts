module SinglefinModule {
    export class SelectBinding {

        in(container: any, element: any, data: any, key: string) {
            if(!element.is('select')) {
                return;
            }

            if(!key) {
                console.error("select binding error: variable key is undefined or null");
                
                return;
            }

            data[key] = element.val();

            element.on("change", {
                data: data,
                key: key
            }, (event: any) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var inputElement = $(event.currentTarget);
                var value = inputElement.val();
            
                _data[_key] = value;
            });
        }

        is(container: any, element: any, data: any, key: string) {
        }
    }
}