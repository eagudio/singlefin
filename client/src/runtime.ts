module SinglefinModule {
    export class Runtime {
        static getParentInstance(data: any, exp: string) {
            var vars = exp.split(/[.\[\]]/);
            var _data = data;

            vars = vars.filter((value) => {
                return value != "";
            });

            if(vars.length == 1) {
                return _data[vars[0]];
            }

            for(var i=0; i < vars.length-1; i++) {
                _data = _data[vars[i]];
            }

            return _data;
        }

        /*static setInstance(exp: string, data: any, instance: any) {
            var vars = exp.split(".");
            var _data = data;

            if(vars.length == 1) {
                this.setItem(vars[0], data, instance);

                return;
            }

            if(vars.length > 1) {
                for(var i=0; i<vars.length-2; i++) {
                    //_data = this.getItem(_data, vars[i]);
                    _data = _data[vars[i]];
                }
            
                this.setItem(vars[vars.length-2], _data, instance);

                return;
            }
        }*/

        static getProperty(data: any, exp: string) {
            var vars = exp.split(".");
            var value = data;

            for(var i=0; i<vars.length; i++) {
                value = this.getItem(value, vars[i]);
            }

            return value;
        }

        static setProperty(exp: string, data: any, value: any) {
            var vars = exp.split(".");
            var _data = data;

            for(var i=0; i<vars.length-1; i++) {
                _data = this.getItem(_data, vars[i]);
            }

            this.setItem(vars[vars.length-1], _data, value);
        }

        static getParentPath(exp: string) {
            var vars = exp.split(/[.\[]/);
            var _path = "";
            var count = 0;

            if(vars.length == 1) {
                return vars[0];
            }

            vars.map((value) => {
                var newValue = value;
                var isArrayItem = false;

                if(value.charAt(value.length - 1) === "]") {                    
                    newValue = "[" + value;
                    isArrayItem = true;
                }

                if(count < vars.length - 1) {
                    if(count > 0 && !isArrayItem) {
                        _path += "." + newValue;
                    }
                    else {
                        _path += newValue;
                    }
                }

                count++;
              
                return newValue;
            });

            return _path;
        }

        /*static hasPropertyName(data: any, exp: string) {
            var vars = exp.split(".");
            var _data = data;

            for(var i=0; i<vars.length-1; i++) {
                _data = _data[vars[i]];
            }

            return _data[vars[vars.length-1]] != undefined;
        }*/

        static getPropertyName(exp: string) {
            var vars = exp.split(".");

            return this.getItemName(vars[vars.length-1]);
        }

        private static getItemName(exp: string) {
            var res = exp.split("[");

            if(res.length === 1) {
                return res[0];
            }

            var index = res[1].substring(0, res[1].length - 1);

            return index;
        }

        private static getItem(data: any, exp: string) {            
            var res = exp.split("[");

            if(res.length === 1) {
                return data[res[0]];
            }

            var array = res[0];
            var index = res[1].substring(0, res[1].length - 1);

            return data[array][index];
        }

        private static setItem(exp: string, data: any, instance: any) {
            var res = exp.split("[");

            if(res.length === 1) {
                data[res[0]] = instance;

                return;
            }

            var array = res[0];
            var index = res[1].substring(0, res[1].length - 1);

            data[array][index] = instance;
        }
    }
}

/** UNIT TEST **/
//export default SinglefinModule.Runtime;
/** **/
