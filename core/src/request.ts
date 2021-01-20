module SinglefinModule {
    export class Request {
        private _data: any;
        private _result: any;
        private _then: any;
        private _catch: any;

        constructor(_data: any, _result: any, _then: any, _catch: any) {
            this._data = _data;
            this._result = _result;
            this._then = _then;
            this._catch = _catch;
        }
        
        call(models: any, httpMethod: string, route: string, path?: string) {
            return new Promise((resolve, reject: any) => {
                var jsonData: any = {};

                for(var key in this._data) {
                    jsonData[key] = Runtime.getProperty(models, this._data[key]);
                }
                            
                try {
                    var stringifyData: string = JSON.stringify(jsonData);

                    var servicePath = route;

                    if(path) {
                        servicePath = path + "/" + route;
                    }

                    $.ajax({
                        type: httpMethod,
                        url: servicePath,
                        data: stringifyData,
                        success: (response: any) => {
                            if(response) {
                                for(var key in this._result) {
                                    if(typeof response[key] !== 'undefined' && this._result[key]) {
                                        Runtime.setProperty(this._result[key], models, response[key]);
                                    }
                                }
                            }

                            resolve();
                        },
                        error: (error: any) => {
                            if(this._result["error"]) {
                                Runtime.setProperty(this._result["error"], models, error.responseText);
                            }

                            reject();
                        },
                        contentType: "application/json"
                    });
                }
                catch(ex) {
                    reject(ex);
                }
            });
        }    
    }
}