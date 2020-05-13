module Browser {
    export class Browser {
        private _body: string = "__body";
        private _instances: any[] = [];
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
        private _handlers: any = {};
        private _schema: Schema = new Schema();


        init(resources, styles, schema, homepage, onInit) {
            var params = browser._private.getUrlParams(window.location.href);
            
            browser._private.loadStyles(styles);
            
            browser._private.loadResources(resources);
    
            this._schema.load(schema, this).then(() => {
                var _homepage = homepage;
                
                if(params) {
                    if(params.page) {
                        browser._private._home = params.page;
    
                        _homepage = browser._private._home;
                    }
                }
                
                browser.open(_homepage).then(() => {
                    onInit();
                });
            });
        }

        page(pageName) {
            return browser._private._pages[pageName];
        }

        open(pageName, parameters) {
            return new Promise((resolve) => {
                var _pageName = browser._private._body + "/" + pageName;
            
                browser._private.draw(_pageName, parameters).then(() => {
                    resolve(browser._private._pages[_pageName]);
                }, (error) => {
                    console.error("an error occurred during open page '" + pageName + "': " + error);
    
                    resolve();
                });
            });
        }
        
        refresh(pageName, parameters) {
            return new Promise((resolve) => {
                var _pageName = browser._private._body + "/" + pageName;
            
                browser._private.redraw(_pageName, parameters).then(() => {
                    resolve(browser._private._pages[_pageName]);
                }, (error) => {
                    console.error("an error occurred during refresh page '" + pageName + "': " + error);
    
                    resolve();
                });
            });
        }
        
        close (pageName) {
            return new Promise((resolve) => {
                var _pageName = browser._private._body + "/" + pageName;
                var page = browser._private._pages[_pageName];
    
                if(!page) {
                    page = browser._private._surrogates[_pageName];
                    
                    if(!page) {
                        console.error("an error occured during close page: page '" + pageName + "' not found");
                    
                        return resolve();
                    }
                }
                
                browser._private.close(page).then(() => {
                    resolve();
                }, (error) => {
                    console.error("an error occurred during close page '" + pageName + "': " + error);
    
                    resolve();
                });
            });
        }
        
        trigger(event, data) {
            var paths = [];
    
            if(browser._private._handlers[event]) {
                paths = browser._private._handlers[event];
            }
    
            for(var h=0; h<paths.length; h++) {
                var handlerPage = browser._private._pages[paths[h]];
    
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

        get body() {
            return this._body;
        }

        get pages() {
            return this._pages;
        }

        get handlers() {
            return this._handlers;
        }

        addPage(action: string, pageName: string, pagePath: string, container: string, view: string, htmlview: string, controllers: any[], models: any, replace, append, unwind, key, events, parameters) {
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
    }
}

interface Window {
    browser: any;
    $b: any;
}

window.browser = window.browser || new Browser.Browser();
window.$b = window.$b || window.browser || new Browser.Browser();