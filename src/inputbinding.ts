module SinglefinModule {
    export class InputBinding {

        in(container: any, element: any, data: any, key: string) {
            if(!element.is('input')) {
                return;
            }

            if(!key) {
                console.error("input binding error: variable key is undefined or null");
                
                return;
            }

            element.on("change paste keyup", {
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