module SinglefinModule {
    export class Request {
        private _route: string;
        private _httpMethod: string;
        private _done: string;
        private _error: string;
        private _data: any;
        private _result: any;

        constructor(config: any) {//_route: string, _httpMethod: string, _data: any, _result: any) {
            this._route = config.route;
            this._httpMethod = config.httpMethod ? config.httpMethod : "post";
            this._done = config.done;
            this._error = config.error;
            this._data = config.data;
            this._result = config.result;
        }
        
        call(singlefin: Singlefin, page: Page, models: any, parameters: any, pageModels: any) {
            return new Promise<void>((resolve, reject: any) => {
                var jsonData: any = {};

                for(var key in this._data) {
                    jsonData[key] = Runtime.getProperty(models, this._data[key]);
                }

                if(!this._data) {
                    jsonData = parameters;
                }
                            
                try {
                    var stringifyData: string = JSON.stringify(jsonData);

                    $.ajax({
                        type: this._httpMethod,
                        url: this._route,
                        data: stringifyData,
                        success: (response: any) => {
                            if(response) {
                                for(var key in this._result) {
                                    if(typeof response[key] !== 'undefined' && this._result[key]) {
                                        Runtime.setProperty(this._result[key], models, response[key]);
                                    }
                                }
                            }

                            return page.handleEvent(singlefin, page.events, this._done, page, parameters, pageModels);
                        },
                        error: (error: any) => {
                            if(this._result["error"]) {
                                Runtime.setProperty(this._result["error"], models, error.responseText);
                            }

                            return page.handleEvent(singlefin, page.events, this._error, page, parameters, pageModels);
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