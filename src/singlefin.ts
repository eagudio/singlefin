/*!
 * Browser JavaScript Library v0.0.1
 * https://github.com/eagudio/browser
 *
 * Includes jquery.js
 * http://jquery.com/
 * 
 * Includes require.js
 * http://requirejs.com/
 *
 * Released under the MIT license
 * https://github.com/eagudio/browser/blob/master/LICENSE
 *
 * Date: 2020-05-21T15:59Z
 */

module SinglefinModule {
    export class Singlefin {
        private _home: string = "__body";
        private _body: string = "__body";
        private _instances: any[] = [];
        private _styles: string[] = [];
        private _pages: any = {};
        private _handlers: any = {};
        private _defaultLanguage: string = "it-IT";
        private _resources: any = {
            "it-IT": {}
        };

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

        get handlers() {
            return this._handlers;
        }

        getBody() {
            return this._pages[this._body];
        }

        init(config: any) {
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
                    
                    return this.open(_homepage);
                }, () => {

                });
            }
            catch(ex) {
                console.error("an error occurred during init singlefin: " + ex);
            }
        }

        open(pageName: string, parameters?: any) {
            return new Promise((resolve) => {
                var _pageName = this._body + "/" + pageName;

                if(_pageName == this.body) {
                    return resolve(this._pages[_pageName]);
                }
                
                var page: Page = this.pages[_pageName];
    
                if(!page) {
                    console.error("an error occurred during open page '" + pageName + "': page not found");
                    
                    return resolve();
                }

                page.draw(this, parameters).then(() => {
                    resolve(page);
                }, (error: any) => {
                    console.error("an error occurred during open page '" + pageName + "'");
    
                    resolve();
                });
            });
        }
        
        refresh(pageName: string, parameters: any) {
            return new Promise((resolve) => {
                var _pageName = this._body + "/" + pageName;

                if(_pageName == this.body) {
					return resolve(this._pages[_pageName]);
				}
				
				var page: Page = this.pages[_pageName];
	
				if(!page) {
                    console.error("an error occurred during refresh page '" + pageName + "': page not found");
                    
                    return resolve();
				}

                page.redraw(this, parameters).then(() => {
                    resolve(page);
                }, (error: any) => {
                    console.error("an error occurred during refresh page '" + pageName + "'");
    
                    resolve();
                });
            });
        }

        nextGroupStep(pageName: string, parameters: any) {
            return new Promise((resolve) => {
                var _pageName = this._body + "/" + pageName;

                if(_pageName == this.body) {
					return resolve(this._pages[_pageName]);
				}
				
				var page: Page = this.pages[_pageName];
	
				if(!page) {
                    console.error("an error occurred during next step of page '" + pageName + "': page not found");
                    
                    return resolve();
				}

                page.nextStep(this, parameters).then(() => {
                    resolve(page);
                }, (error: any) => {
                    console.error("an error occurred during next step of page '" + pageName + "'");
    
                    resolve();
                });
            });
        }

        previousGroupStep(pageName: string, parameters: any) {
            return new Promise((resolve) => {
                var _pageName = this._body + "/" + pageName;

                if(_pageName == this.body) {
					return resolve(this._pages[_pageName]);
				}
				
				var page: Page = this.pages[_pageName];
	
				if(!page) {
                    console.error("an error occurred during next step of page '" + pageName + "': page not found");
                    
                    return resolve();
				}

                page.previousStep(this, parameters).then(() => {
                    resolve(page);
                }, (error: any) => {
                    console.error("an error occurred during next step of page '" + pageName + "'");
    
                    resolve();
                });
            });
        }

        openGroupStep(pageName: string, index: number, parameters: any) {
            return new Promise((resolve) => {
                var _pageName = this._body + "/" + pageName;

                if(_pageName == this.body) {
					return resolve(this._pages[_pageName]);
				}
				
				var page: Page = this.pages[_pageName];
	
				if(!page) {
                    console.error("an error occurred during next step of page '" + pageName + "': page not found");
                    
                    return resolve();
				}

                page.openGroupByIndex(this, index, parameters).then(() => {
                    resolve(page);
                }, (error: any) => {
                    console.error("an error occurred during next step of page '" + pageName + "'");
    
                    resolve();
                });
            });
        }

        getGroupCount(pageName: string) {
            var _pageName = this._body + "/" + pageName;
            
            var page: Page = this.pages[_pageName];

            if(!page) {
                console.error("an error occurred during get group count of page '" + pageName + "': page not found");
            }

            return page.group.length;
        }

        getGroupIndex(pageName: string) {
            var _pageName = this._body + "/" + pageName;
            
            var page: Page = this.pages[_pageName];

            if(!page) {
                console.error("an error occurred during get group index of page '" + pageName + "': page not found");
            }

            return page.groupIndex;
        }

        isFirstGroupStep(pageName: string) {
            var _pageName = this._body + "/" + pageName;
            
            var page: Page = this.pages[_pageName];

            if(!page) {
                console.error("an error occurred during check first group step of page '" + pageName + "': page not found");
            }

            return page.groupIndex == 0;
        }

        isLastGroupStep(pageName: string) {
            var _pageName = this._body + "/" + pageName;
            
            var page: Page = this.pages[_pageName];

            if(!page) {
                console.error("an error occurred during check last group step of page '" + pageName + "': page not found");
            }

            return page.groupIndex == page.group.length - 1;
        }

        setNextGroupStepEnabled(pageName: string, enabled: boolean) {
            var _pageName = this._body + "/" + pageName;
            
            var page: Page = this.pages[_pageName];

            if(!page) {
                console.error("an error occurred during set next group step enabled of page '" + pageName + "': page not found");
            }

            page.setNextGroupStepEnabled(this, enabled);
        }

        isNextGroupStepEnabled(pageName: string) {
            var _pageName = this._body + "/" + pageName;
            
            var page: Page = this.pages[_pageName];

            if(!page) {
                console.error("an error occurred during check next group step enabled of page '" + pageName + "': page not found");
            }

            return page.isNextGroupStepEnabled(this);
        }

        setPreviousGroupStepEnabled(pageName: string, enabled: boolean) {
            var _pageName = this._body + "/" + pageName;
            
            var page: Page = this.pages[_pageName];

            if(!page) {
                console.error("an error occurred during set previous group step enabled of page '" + pageName + "': page not found");
            }

            page.setPreviousGroupStepEnabled(this, enabled);
        }

        isPreviousGroupStepEnabled(pageName: string) {
            var _pageName = this._body + "/" + pageName;
            
            var page: Page = this.pages[_pageName];

            if(!page) {
                console.error("an error occurred during check previous group step enabled of page '" + pageName + "': page not found");
            }

            return page.isPreviousGroupStepEnabled(this);
        }
        
        close(pageName: string, parameters: any) {
            return new Promise((resolve) => {
                var _pageName = this._body + "/" + pageName;
                var page: Page = this.pages[_pageName];
    
                if(!page) {
                    console.error("an error occured during close page: page '" + pageName + "' not found");
                    
                    return resolve();
                }
                
                page.close(this, parameters).then(() => {
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
    
                if(handlerPage.controller && handlerPage.controller[event]) {
                    handlerPage.controller[event](eventObject);
                }
            }
        }
        
        static getURLPath() {
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

        addBody(name: string) {
            var body: Page = new Page(name, false, "", this._body, "", null, [], {}, [], [], [], [], "", [], null);

            this._pages[this._body] = body;
        }

        addPage(pageName: string, disabled: boolean, action: string, pagePath: string, container: string, view: string, controllers: any[], models: any, replace: any[], append: any[], group: any[], unwind: any[], key: string, events: string[], parameters: any): Page {
			if(view) {
				this._instances.push("text!" + view);
			}

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
            
            var bodyRegexp = new RegExp("^(" + this.body + "/)");
			var pathContainer = container.replace(bodyRegexp, "");

            this._pages[pagePath] = new Page(pageName, disabled, action, container, pathContainer + "/" + pageName, view ? "text!" + view : undefined, controllers, models, replace, append, group, unwind, key, events, parameters);

            return this._pages[pagePath];
        }

        addSurrogate(name: string, path: string, page: Page) {
            var replaceChildren = this.createSurrogates(path, page.replace);
            var appendChildren = this.createSurrogates(path, page.append);
            var groupChildren = this.createSurrogates(path, page.group);
            var unwindChildren = this.createSurrogates(path, page.unwind);

            var bodyRegexp = new RegExp("^(" + this.body + "/)");
            var pathContainer = page.container.replace(bodyRegexp, "");

            this._pages[path] = new Page(name, page.disabled, page.action, page.container, pathContainer + "/" + name, page.view, page.controllers, page.models, replaceChildren, appendChildren, groupChildren, unwindChildren, page.key, page.events, page.parameters);

            return this._pages[path];
        }

        createSurrogates(path: string, pagesPath: string[]) {
            var surrogates = [];
			
			for(var i=0; i<pagesPath.length; i++) {
                var page: Page = this.pages[pagesPath[i]];
                var pagePath = path + "/" + page.name;

				surrogates.push(pagePath);

				this.addSurrogate(page.name, pagePath, page);
            }

			return surrogates;
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
                            if(this._pages[key].view) {
                                this._pages[key].view = loader.getInstance(this._pages[key].view);
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
                        console.error("load instances error: " + ex);
                        
                        reject("load instances error: " + ex);
                    }
                }, (error) => {
                    console.error("load instances error");

                    reject("load instances error");
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
    //browser: any;
    //singlefin: any;
    Singlefin: SinglefinModule.Singlefin;
    //$s: any;
}

//window.browser = window.browser || new SinglefinModule.Singlefin();
//window.singlefin = window.singlefin || window.browser || new SinglefinModule.Singlefin();
window.Singlefin = window.Singlefin || SinglefinModule.Singlefin;
//window.$s = window.$s || window.browser || new SinglefinModule.Singlefin();