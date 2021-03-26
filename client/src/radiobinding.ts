module SinglefinModule {
    export class RadioBinding {

        in(container: any, element: any, data: any, key: string) {
            if(!element.is(':radio')) {
                return;
            }

            if(!key) {
                return;
            }

            var checked = element.is(":checked");
            var value = element.val();

            if(checked) {
                Runtime.setProperty(key, data, value);
            }

            element.on("click", {
                data: data,
                key: key
            }, (event: any) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var inputElement = $(event.currentTarget);
                var value = inputElement.val();

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

            var checked = element.is(":checked");

            Runtime.setProperty(key, data, checked);

            element.on("click", {
                data: data
            }, (event: any) => {
                var _data = event.data.data;
                var name = element.attr("name");
                var radios = container.find('input[type="radio"][name ="' + name + '"]');
    
                for(var i=0; i < radios.length; i++) {
                    var radioElement = $(radios[i]);
                    var _checked = radioElement.is(":checked");
                    var isAttributeValue = radioElement.attr("is");
                    
                    if(isAttributeValue) {
                        Runtime.setProperty(isAttributeValue, _data, _checked);
                    }
                }
            });
        }
    }
}