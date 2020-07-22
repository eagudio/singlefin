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

        outClass(container: any, element: any, data: any, exp: string) {
            var validator: any = {
                set: function(target: any, prop: any, value: any) {
                    //TODO: esegue il codice di exp
                    //TODO: ottiene un oggetto di nome classe e boolean (true se la classe deve essere aggiunta, false se deve essere tolta)
                    //TODO: scorre l'oggetto e aggiunge e toglie classi
                    console.log("hi!!!");
                    
                    target[prop] = value;
                    
                    return true;
                }
            };
            
            //TODO: data deve essere un Proxy... dove!?
            const proxy = new Proxy(data, validator);
        }

        outAttribute() {

        }
    }
}