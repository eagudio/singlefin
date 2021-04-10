module SinglefinModule {
    export class RadioBinding {

        in(container: any, element: any, data: any, key: string) {
            if(!element.is(':radio')) {
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
            if(!element.is(':radio')) {
                return;
            }

            if(!key) {
                return;
            }

            let checked = element.is(":checked");

            Runtime.setProperty(key, data, checked);

            element.on("click", {
                data: data
            }, (event: any) => {
                let _data = event.data.data;
                let name = element.attr("name");
                let radios = container.find('input[type="radio"][name ="' + name + '"]');
    
                for(let i=0; i < radios.length; i++) {
                    let radioElement = $(radios[i]);
                    let _checked = radioElement.is(":checked");
                    let isAttributeValue = radioElement.attr("is");
                    
                    if(isAttributeValue) {
                        Runtime.setProperty(isAttributeValue, _data, _checked);
                    }
                }
            });
        }
    }
}