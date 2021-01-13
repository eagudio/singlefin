module SinglefinModule {
    export class Runtime {
        static getParentInstance(data: any, exp: string) {
            var vars = exp.split(".");
            var _data = data;

            if(vars.length == 1) {
                //return this.getArray(_data, vars[0]);
                var array = this.getArray(_data, vars[0]);
              
                if(!array) {
                    return _data[vars[0]];
                }
              
                return array;
            }

            if(vars.length > 1) {
                for(var i=0; i<vars.length-2; i++) {
                    _data = _data[vars[i]];
                }

                var array = this.getArray(_data, vars[vars.length - 2]);
                
                if(array) {
                    return this.getItem(_data, vars[vars.length-2]);
                }
            
                return _data[vars[vars.length-2]];

                //return this.getItem(_data, vars[vars.length-2]);
            }

            return data
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
            var vars = exp.split(".");
            var _path = "";
          
            if (vars.length === 1) {    
                var arrayName = this.getArrayName(vars[0]);
              
                if(!arrayName) {
                    return vars[0];
                }
              
                return arrayName;
            }
          
            if (vars.length > 1) {
                for (var i = 0; i < vars.length - 2; i++) {
                    _path += vars[i] + ".";
                }
                
                var arrayName = this.getArrayName(vars[vars.length - 1]);
                
                if(arrayName) {
                    return _path += vars[vars.length - 2] + "." + arrayName;
                }
            
                return _path += vars[vars.length - 2];
            }
          
            return _path
        }

        /*static getParentPath(exp: string) {
            //product.items[0].description
            var vars = exp.split(".");
            var _path = "";

            //TODO: qui non funziona! getItemName deve ritornare [indice] o il nome variabile
            if(vars.length === 1) {
                return this.getItemName(vars[0]);
            }

            if(vars.length > 1) {
                for(var i=0; i<vars.length-2; i++) {
                    _path += vars[i] + ".";
                }

                return _path += this.getItemName(vars[vars.length-2]);
            }

            return _path
        }*/

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

        private static getArrayName(exp: string) {
            var res = exp.split("[");
            
            if(res.length > 1) {
                return res[0];
            }
            
            return null;
        }

        private static getArray(data: any, exp: string) {            
            var res = exp.split("[");

            if(res.length > 1) {
                return data[res[0]];
            }
            
            return null;

            /*if(res.length === 1) {
                return data[res[0]];
            }

            var array = res[0];

            return data[array];*/
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
export default SinglefinModule.Runtime;
/** **/
