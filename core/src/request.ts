module SinglefinModule {
    export class Request {
        private _route: string;
        private _httpMethod: string;
        private _done: string;
        private _error: string;
        private _models: any;

        constructor(config: any) {//_route: string, _httpMethod: string, _data: any, _result: any) {
            this._route = config.route;
            this._httpMethod = config.httpMethod ? config.httpMethod : "post";
            this._done = config.done;
            this._error = config.error;
            this._models = config.models ? config.models : {};
        }
        
        call(singlefin: Singlefin, page: Page, models: any, parameters: any, pageModels: any) {
            return new Promise<void>((resolve, reject: any) => {
                var jsonData: any = {};

                if(!this._models.data) {
                    jsonData = parameters;
                }
                else {
                    jsonData = Runtime.getProperty(models, this._models.data);
                }
                            
                try {
                    var stringifyData: string = JSON.stringify(jsonData);

                    $.ajax({
                        type: this._httpMethod,
                        url: this._route,
                        data: stringifyData,
                        success: (response: any) => {
                            if(typeof response !== 'undefined' && this._models.result) {
                                Runtime.setProperty(this._models.result, models, response);
                            }

                            page.handleEvent(singlefin, page.events, this._done, page, parameters, pageModels).then(() => {
                                resolve();
                            }).catch(() => {
                                reject();
                            });
                        },
                        error: (error: any) => {
                            if(error && this._models.error) {
                                Runtime.setProperty(this._models.error, models, error.responseText);
                            }

                            page.handleEvent(singlefin, page.events, this._error, page, parameters, pageModels).then(() => {
                                resolve();
                            }).catch(() => {
                                reject();
                            });
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