module SinglefinModule {
    export class Request {
        private _config: any;
        private _route: string;
        private _httpMethod: string;
        private _models: any;

        constructor(config: any) {
            this._config = config;
            
            this._route = config.route;
            this._httpMethod = config.httpMethod ? config.httpMethod : "post";
            this._models = config.models ? config.models : {};
        }
        
        call(singlefin: Singlefin, page: Page, models: any, parameters: any, pageModels: any) {
            return new Promise<void>((resolve: any, reject: any) => {
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

                            page.eventManager.handleEvent(singlefin, this._config, "resolved", page, parameters, null).then(() => {
                                resolve();
                            }).catch(() => {
                                reject();
                            });
                        },
                        error: (error: any) => {
                            if(error && this._models.error) {
                                Runtime.setProperty(this._models.error, models, error.responseText);
                            }

                            page.eventManager.handleEvent(singlefin, this._config, "rejected", page, parameters, null).then(() => {
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