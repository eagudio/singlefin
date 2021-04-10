module SinglefinModule {
    export class Runtime {
        static getParentInstance(data: any, exp: string) {
            let vars = exp.split(/[.\[\]]/);
            let _data = data;

            vars = vars.filter((value) => {
                return value != "";
            });

            if(vars.length == 1) {
                return _data[vars[0]];
            }

            for(let i=0; i < vars.length-1; i++) {
                _data = _data[vars[i]];
            }

            return _data;
        }

        /*static setInstance(exp: string, data: any, instance: any) {
            let vars = exp.split(".");
            let _data = data;

            if(vars.length == 1) {
                this.setItem(vars[0], data, instance);

                return;
            }

            if(vars.length > 1) {
                for(let i=0; i<vars.length-2; i++) {
                    //_data = this.getItem(_data, vars[i]);
                    _data = _data[vars[i]];
                }
            
                this.setItem(vars[vars.length-2], _data, instance);

                return;
            }
        }*/

        static getProperty(data: any, exp: string) {
            let vars = exp.split(".");
            let value = data;

            for(let i=0; i<vars.length; i++) {
                value = this.getItem(value, vars[i]);
            }

            return value;
        }

        static setProperty(exp: string, data: any, value: any) {
            let vars = exp.split(".");
            let _data = data;

            for(let i=0; i<vars.length-1; i++) {
                _data = this.getItem(_data, vars[i]);
            }

            this.setItem(vars[vars.length-1], _data, value);
        }

        static getParentPath(exp: string) {
            let vars = exp.split(/[.\[]/);
            let _path = "";
            let count = 0;

            if(vars.length == 1) {
                return vars[0];
            }

            vars.map((value) => {
                let newValue = value;
                let isArrayItem = false;

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
            let vars = exp.split(".");
            let _data = data;

            for(let i=0; i<vars.length-1; i++) {
                _data = _data[vars[i]];
            }

            return _data[vars[vars.length-1]] != undefined;
        }*/

        static getPropertyName(exp: string) {
            let vars = exp.split(".");

            return this.getItemName(vars[vars.length-1]);
        }

        private static getItemName(exp: string) {
            let res = exp.split("[");

            if(res.length === 1) {
                return res[0];
            }

            let index = res[1].substring(0, res[1].length - 1);

            return index;
        }

        private static getItem(data: any, exp: string) {            
            let res = exp.split("[");

            if(res.length === 1) {
                return data[res[0]];
            }

            let array = res[0];
            let index = res[1].substring(0, res[1].length - 1);

            return data[array][index];
        }

        private static setItem(exp: string, data: any, instance: any) {
            let res = exp.split("[");

            if(res.length === 1) {
                data[res[0]] = instance;

                return;
            }

            let array = res[0];
            let index = res[1].substring(0, res[1].length - 1);

            data[array][index] = instance;
        }
    }
}

/** UNIT TEST **/
//export default SinglefinModule.Runtime;
/** **/
