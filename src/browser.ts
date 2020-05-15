module BrowserModule {
    export class Browser {
        private _home: string = "__body";
        private _body: string = "__body";
        private _instances: any[] = [];
        private _styles: string[] = [];
        private _pages: any = {
            __body: {
                container: "__body",
                view: {
                    render: (parameters: any) => {
                        return new Promise((resolve, reject) => {
                            resolve($("body"));
                        });
                    }
                },
                controllers: [],
                models: {},
                events: [],
                htmlElement: $("body")
            }
        };
        private _surrogates: any = {};
        private _handlers: any = {};
        private _defaultLanguage: string = "it-IT";
        private _resources: any = {
            "it-IT": {}
        };


        init(config: any, onInit: any) {
            try {
                var params = this.getUrlParams(window.location.href);

                var configLoader = new ConfigLoader();

                configLoader.load(config, this);

                this.loadInstances().then(() => {
                    var _homepage = config.homepage;
                
                    if(params) {
                        if(params.page) {
                            this._home = params.page;
        
                            _homepage = this._home;
                        }
                    }
                    
                    this.open(_homepage).then(() => {
                        onInit();
                    });
                }, () => {

                });
            }
            catch(ex) {
                console.error("an error occurred during init browser");
            }
        }

        open(pageName: string, parameters?: any) {
            return new Promise((resolve) => {
                var _pageName = this._body + "/" + pageName;

                var browserHandler = new BrowserHandler(this);
            
                browserHandler.draw(_pageName, parameters).then(() => {
                    resolve(this._pages[_pageName]);
                }, (error: any) => {
                    console.error("an error occurred during open page '" + pageName + "'");
    
                    resolve();
                });
            });
        }
        
        refresh(pageName: string, parameters: any) {
            return new Promise((resolve) => {
                var _pageName = this._body + "/" + pageName;

                var browserHandler = new BrowserHandler(this);
            
                browserHandler.redraw(_pageName, parameters).then(() => {
                    resolve(this.pages[_pageName]);
                }, (error: any) => {
                    console.error("an error occurred during refresh page '" + pageName + "'");
    
                    resolve();
                });
            });
        }
        
        close (pageName: string) {
            return new Promise((resolve) => {
                var _pageName = this._body + "/" + pageName;
                var page = this.pages[_pageName];
    
                if(!page) {
                    page = this._surrogates[_pageName];
                    
                    if(!page) {
                        console.error("an error occured during close page: page '" + pageName + "' not found");
                    
                        return resolve();
                    }
                }

                var browserHandler = new BrowserHandler(this);
                
                browserHandler.close(page).then(() => {
                    resolve();
                }, (error: any) => {
                    console.error("an error occurred during close page '" + pageName + "'");
    
                    resolve();
                });
            });
        }
        
        trigger(event: any, data: any) {
            var paths = [];
    
            if(this._handlers[event]) {
                paths = this._handlers[event];
            }
    
            for(var h=0; h<paths.length; h++) {
                var handlerPage = this.pages[paths[h]];
    
                var eventObject = {
                    browser: {
                        event: "event",
                        handler: event,
                        data: data,
                        path: paths[h],
                        page: handlerPage
                    }
                };
                
                if(handlerPage.view[event]) {
                    handlerPage.view[event](eventObject);
                }
    
                if(handlerPage.controller && handlerPage.controller[event]) {
                    handlerPage.controller[event](eventObject);
                }
            }
        }
        
        getURLPath() {
            var path = window.location.href;
    
            var paths = path.split("/");
    
            if(paths.length > 2) {
                var basePath = "/";
    
                for(var i=3; i<paths.length; i++) {
                    var qualifyPaths = paths[i].split("?");
                    
                    basePath += qualifyPaths[0];
                }
                
                return basePath;
            }
    
            return "/";
        }

        get instances() {
            return this._instances;
        }

        set resources(_resources: any) {
            this._resources = _resources;
        }

        get resources() {
            return this._resources;
        }

        get defaultResources() {
            return this._resources[this._defaultLanguage];
        }

        set styles(_styles: string[]) {
            this._styles = _styles;
        }

        get styles() {
            return this._styles;
        }

        get body() {
            return this._body;
        }

        get pages() {
            return this._pages;
        }

        get surrogates() {
            return this._surrogates;
        }

        get handlers() {
            return this._handlers;
        }

        addPage(action: string, pageName: string, pagePath: string, container: string, view: string, htmlview: string, controllers: any[], models: any, replace: any[], append: any[], unwind: any[], key: string, events: string[], parameters: any) {
			if(typeof view != "string") {
				throw "view must be a string";
			}

			if(htmlview) {
				//TODO: vedi https://github.com/requirejs/text per il plugin text...
				this._instances.push("text!" + htmlview);
			}

			this._instances.push(view);

			if(controllers) {
				for(var i=0; i<controllers.length; i++) {
					this._instances.push(controllers[i]);
				};
			}

			if(models) {				
				for (var modelKey in models) {
					this._instances.push(models[modelKey]);
				}
			}
			
			this._pages[pagePath] = {
				name: pageName,
				action: action,
				container: container,
				view: view,
				htmlview: htmlview ? "text!" + htmlview : undefined,
				controllers: controllers,
				models: models,
				replace: replace,
				append: append,
				unwind: unwind,
				key: key,
				events: events,
				parameters: parameters
			};
        }
        
        private loadInstances() {
			return new Promise(async (resolve, reject) => {
                var loader = new Loader();

                loader.load(this._instances).then(() => {
                    try {
                        for(var i=0; i<this._styles.length; i++) {
                            $('head').append(`<link rel="stylesheet" href="` + this._styles[i] + `.css" type="text/css" />`);
                        }

                        for (var key in this._resources) {
                            this._resources[key] = loader.getInstance(this._resources[key]);
                        }

                        for (var key in this._pages) {
                            if(typeof this._pages[key].view == "string") {
                                this._pages[key].view = loader.getInstance(this._pages[key].view);
                            }

                            if(typeof this._pages[key].htmlview == "string") {
                                this._pages[key].htmlview = loader.getInstance(this._pages[key].htmlview);
                            }

                            var controllers: any[] = [];

                            if(this._pages[key].controllers && Array.isArray(this._pages[key].controllers)) {
                                controllers = this._pages[key].controllers.map((controller: string) => {
                                    return loader.getInstance(controller);
                                });
                            }

                            this._pages[key].controllers = controllers;

                            var models: any = null;

                            if(this._pages[key].models) {
                                models = {};

                                for (var modelKey in this._pages[key].models) {
                                    models[modelKey] = loader.getInstance(this._pages[key].models[modelKey]);
                                }
                            }

                            this._pages[key].models = models;
                        }

                        resolve();
                    }
                    catch(ex) {
                        console.error("load instances error");
                        
                        reject(ex);
                    }
                }, (error) => {
                    console.error("load instances error");

                    reject(error);
                });
			});
        }
        
        getUrlParams(url: string) {
			var queryString = url.split("?");

			var query = "";

			if(queryString.length < 2) {
				return null;
			}

			query = queryString[1];
			
			var vars = query.split("&");
			var queryObject: any = {};

			for (var i=0; i<vars.length; i++) {
				var pair = vars[i].split("=");
				var key = decodeURIComponent(pair[0]);
				var value = decodeURIComponent(pair[1]);

				if(typeof queryObject[key] === "undefined") {
					queryObject[key] = decodeURIComponent(value);
				}
				else if (typeof queryObject[key] === "string") {
					var arr = [queryObject[key], decodeURIComponent(value)];
					queryObject[key] = arr;
				}
				else {
					queryObject[key].push(decodeURIComponent(value));
				}
			}

			return queryObject;
		}
    }
}

interface Window {
    browser: any;
    $b: any;
}

window.browser = window.browser || new BrowserModule.Browser();
window.$b = window.$b || window.browser || new BrowserModule.Browser();