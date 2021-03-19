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

                this.resolveProxyRequest(singlefin, page, jsonData).then(() => {
                    this.ajaxRequest(singlefin, page, models, parameters, pageModels, jsonData).then(() => {
                        resolve();
                    }).catch((ex: any) => {
                        reject(ex);
                    });
                }).catch((ex: any) => {
                    reject(ex);
                });
            });
        }

        ajaxRequest(singlefin: Singlefin, page: Page, models: any, parameters: any, pageModels: any, data: any) {
            return new Promise<void>((resolve: any, reject: any) => {
                try {
                    var requestData: any = null;
                    var contentType: any = "application/json";
                    var processData;
                    var cache;

                    if(this._config.type == "formdata") {
                        requestData = new FormData();
                        contentType = false;
                        processData = false;
                        cache = false;

                        for(var key in data) {
                            requestData.append(key, data[key]);
                        }
                    }
                    else {
                        requestData = JSON.stringify(data);
                    }

                    $.ajax({
                        type: this._httpMethod,
                        url: this._route,
                        data: requestData,
                        processData: processData,
                        contentType: contentType,
                        cache: cache,
                        success: async (response: any) => {
                            this.resolveProxyResponse(singlefin, page, response).then(() => {
                                if(typeof response !== 'undefined' && this._models.result) {
                                    Runtime.setProperty(this._models.result, models, response);
                                }

                                page.eventManager.handleEvent(singlefin, this._config, "resolved", page, parameters, null).then(() => {
                                    resolve();
                                }).catch(() => {
                                    reject();
                                });
                            }).catch((ex: any) => {
                                reject(ex);
                            });
                        },
                        error: async (error: any) => {
                            this.resolveProxyResponse(singlefin, page, error.responseText).then(() => {
                                if(error && this._models.error) {
                                    Runtime.setProperty(this._models.error, models, error.responseText);
                                }

                                page.eventManager.handleEvent(singlefin, this._config, "rejected", page, parameters, null).then(() => {
                                    resolve();
                                }).catch(() => {
                                    reject();
                                });
                            }).catch((ex: any) => {
                                reject(ex);
                            });
                        }
                    });
                }
                catch(ex) {
                    reject(ex);
                }
            });
        }

        resolveProxyRequest(singlefin: Singlefin, page: Page, data: any) {
            return new Promise<void>(async (resolve, reject) => {
                if(singlefin.proxies.length == 0) {
                    return resolve(data);
                }

                for(var i=0; i<singlefin.proxies.length; i++) {
                    var rejected: boolean = false;

                    await singlefin.proxies[i].proxy.request(page.app, page, singlefin.models, data).then(async (event: string) => {
                        await page.eventManager.handleEvent(singlefin, singlefin.proxies[i].events, event, page, data, null).then(() => {
                            
                        }).catch((ex: any) => {
                            return reject(ex);
                        });
                    }).catch(async (event: string) => {                        
                        rejected = true;

                        await page.eventManager.handleEvent(singlefin, singlefin.proxies[i].events, event, page, data, null).then(() => {
                            
                        }).catch((ex: any) => {
                            return reject(ex);
                        });
                    });
                    
                    if(rejected) {
                        return;
                    }
                }

                return resolve();
            });
        }

        resolveProxyResponse(singlefin: Singlefin, page: Page, data: any) {
            return new Promise<void>(async (resolve, reject) => {
                if(singlefin.proxies.length == 0) {
                    return resolve(data);
                }

                for(var i=0; i<singlefin.proxies.length; i++) {
                    var rejected: boolean = false;

                    await singlefin.proxies[i].proxy.response(page.app, page, singlefin.models, data).then(async (event: string) => {
                        await page.eventManager.handleEvent(singlefin, singlefin.proxies[i].events, event, page, data, null).then(() => {
                            
                        }).catch((ex: any) => {
                            return reject(ex);
                        });
                    }).catch(async (event: string) => {                        
                        rejected = true;

                        await page.eventManager.handleEvent(singlefin, singlefin.proxies[i].events, event, page, data, null).then(() => {
                            
                        }).catch((ex: any) => {
                            return reject(ex);
                        });
                    });
                    
                    if(rejected) {
                        return;
                    }
                }

                return resolve();
            });
        }
    }
}