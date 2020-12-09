module SinglefinModule {
    export class CheckboxBinding {

        in(container: any, element: any, data: any, key: string) {
            if(!element.is(':checkbox')) {
                return;
            }

            if(!key) {
                return;
            }

            var checked = element.is(":checked");
            var value = element.val();

            if(checked) {
                ModelObject.setValue(key, data, value);
            }

            element.on("click", {
                data: data,
                key: key
            }, (event: any) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var inputElement = $(event.currentTarget);
                var value = inputElement.val();

                ModelObject.setValue(_key, _data, value);
            });
        }

        is(container: any, element: any, data: any, key: string) {
            if(!element.is(':checkbox')) {
                return;
            }

            if(!key) {
                return;
            }

            var checked = element.is(":checked");

            ModelObject.setValue(key, data, checked);

            element.on("click", {
                data: data,
                key: key
            }, (event: any) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var inputElement = $(event.currentTarget);
                var checked = inputElement.is(":checked");
            
                ModelObject.setValue(_key, _data, checked);
            });
        }
    }
}