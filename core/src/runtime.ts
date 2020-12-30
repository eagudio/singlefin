module SinglefinModule {
    export class Runtime {
        static getInstance(data: any, exp: string) {
            var vars = exp.split(".");
            var _data = data;

            if(vars.length == 1) {
                return data[vars[0]];
            }

            if(vars.length > 1) {
                for(var i=0; i<vars.length-2; i++) {
                    _data = _data[vars[i]];
                }

                return _data[vars[vars.length-2]];
            }

            return data
        }

        static setInstance(exp: string, data: any, instance: any) {
            var vars = exp.split(".");
            var _data = data;

            if(vars.length == 1) {
                data[vars[0]] = instance;

                return;
            }

            if(vars.length > 1) {
                for(var i=0; i<vars.length-2; i++) {
                    _data = _data[vars[i]];
                }
            
                _data[vars[vars.length-2]] = instance;

                return;
            }
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

        static hasPropertyName(data: any, exp: string) {
            var vars = exp.split(".");
            var _data = data;

            for(var i=0; i<vars.length-1; i++) {
                _data = _data[vars[i]];
            }
            console.log(_data);

            return _data[vars[vars.length-1]] != undefined;
        }

        static getPropertyName(exp: string) {
            var vars = exp.split(".");

            return vars[vars.length-1];
        }
    }
}