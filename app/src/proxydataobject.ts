module SinglefinModule {
    export class ProxyDataObject {
        [key: string]: any

        
        build(data: any, exp: string) {
            var vars = "";
            
            for(var key in data) {
                this[key] = data[key];
                vars = vars + "var " + key + " = this." + key + ";"
            }

            var result;

            var code = vars + `
                result = ` + exp + `;
            `;
            
            eval(code);

            return result;
        }
    }
}