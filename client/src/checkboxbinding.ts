module SinglefinModule {
    export class CheckboxBinding {

        in(container: any, element: any, data: any, key: string) {
            if(!element.is(':checkbox')) {
                return;
            }

            if(!key) {
                return;
            }

            let checked = element.is(":checked");
            let value = element.val();

            if(checked) {
                Runtime.setProperty(key, data, value);
            }

            element.on("click", {
                data: data,
                key: key
            }, (event: any) => {
                let _data = event.data.data;
                let _key = event.data.key;
                let inputElement = $(event.currentTarget);
                let value = inputElement.val();

                Runtime.setProperty(_key, _data, value);
            });
        }

        is(container: any, element: any, data: any, key: string) {
            if(!element.is(':checkbox')) {
                return;
            }

            if(!key) {
                return;
            }

            let checked = element.is(":checked");

            Runtime.setProperty(key, data, checked);

            element.on("click", {
                data: data,
                key: key
            }, (event: any) => {
                let _data = event.data.data;
                let _key = event.data.key;
                let inputElement = $(event.currentTarget);
                let checked = inputElement.is(":checked");
            
                Runtime.setProperty(_key, _data, checked);
            });
        }
    }
}