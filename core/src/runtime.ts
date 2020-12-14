module SinglefinModule {
    export class Runtime {
        static getInstance(data: any, exp: string) {
            var vars = exp.split(".");

            if(vars.length > 0) {
                return data[vars[0]];
            }

            return data
        }

        static getProperty(data: any, exp: string) {
            var vars = exp.split(".");
            var value = data;

            for(var i=0; i<vars.length; i++) {
                value = value[vars[i]];
            }

            return value;
        }

        static setProperty(exp: string, data: any, value: any) {
            var vars = exp.split(".");
            var _data = data;

            for(var i=0; i<vars.length-1; i++) {
                _data = _data[vars[i]];
            }

            _data[vars[vars.length-1]] = value;
        }
    }
}