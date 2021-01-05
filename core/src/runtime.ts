module SinglefinModule {
    export class Runtime {
        static getParentInstance(data: any, exp: string) {
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

        static getParentPath(exp: string) {
            var vars = exp.split(".");
            var _path = "";

            if(vars.length === 1) {
                return vars[0];
            }

            if(vars.length > 1) {
                for(var i=0; i<vars.length-2; i++) {
                    _path += vars[i] + ".";
                }

                return _path += vars[vars.length-2];
            }

            return _path
        }

        static hasPropertyName(data: any, exp: string) {
            var vars = exp.split(".");
            var _data = data;

            for(var i=0; i<vars.length-1; i++) {
                _data = _data[vars[i]];
            }

            return _data[vars[vars.length-1]] != undefined;
        }

        static getPropertyName(exp: string) {
            var vars = exp.split(".");

            return vars[vars.length-1];
        }
    }
}