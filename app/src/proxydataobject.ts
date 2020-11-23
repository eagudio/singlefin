module SinglefinModule {
    export class ProxyDataObject {
        static getValue(data: any, exp: string) {
            var vars = exp.split(".");
            var value = data;

            for(var i=0; i<vars.length; i++) {
                value = value[vars[i]];
            }

            return value;
        }

        static setValue(exp: string, data: any, value: any) {
            var vars = exp.split(".");
            var _data = data;

            for(var i=0; i<vars.length-1; i++) {
                _data = _data[vars[i]];
            }

            _data[vars[vars.length-1]] = value;
        }
    }
}