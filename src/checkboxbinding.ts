module SinglefinModule {
    export class CheckboxBinding {

        in(container: any, element: any, data: any, key: string) {
            if(!element.is(':checkbox')) {
                return;
            }

            if(!key) {
                console.error("checkbox binding error: variable key is undefined or null");
                
                return;
            }

            var checked = element.is(":checked");
            var value = element.val();

            if(checked) {
                data[key] = value;
            }

            element.on("click", {
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
            if(!element.is(':checkbox')) {
                return;
            }

            if(!key) {
                console.error("checkbox binding error: variable key is undefined or null");
                
                return;
            }

            var checked = element.is(":checked");

            data[key] = checked;

            element.on("click", {
                data: data,
                key: key
            }, (event: any) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var inputElement = $(event.currentTarget);
                var checked = inputElement.is(":checked");
            
                _data[_key] = checked;
            });
        }
    }
}