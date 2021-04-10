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
        private _pages: any = {};
        private _models: any = {};
        private _proxies: any[] = [];
        private _handlers: any = {};

        public static moduleMap: any = {};
        public static loadModuleCallbacks: any = {};
        public static modules: any = {};


        constructor(config: any, homepage?: string) {
            this.init(config, homepage);
        }

        get instances() {
            return this._instances;
        }

        get body() {
            return this._body;
        }

        get pages() {
            return this._pages;
        }

        set models(_models: any) {
            this._models = _models;
        }

        get models(): any {
            return this._models;
        }

        set proxies(_proxies: any[]) {
            this._proxies = _proxies;
        }

        get proxies(): any[] {
            return this._proxies;
        }

        get handlers() {
            return this._handlers;
        }

        getBody(): Page {
            return this._pages[this._body];
        }

        init(config: any, homepage?: string) {
            try {
                let params = this.getUrlParams(window.location.href);

                let configLoader = new ConfigLoader();

                configLoader.load(config, this).then(() => {
                    let _homepage = config.homepage;

                    if(homepage) {
                        _homepage = homepage;
                    }

                    if(params) {
                        if(params.page) {
                            this._home = params.page;
        
                            _homepage = this._home;
                        }
                    }
                    
                    return this.open(_homepage);
                }, () => {
                    console.error("an error occurred during init singlefin: config loading error");
                });
            }
            catch(ex) {
                console.error("an error occurred during init singlefin: " + ex);
            }
        }

        open(pageName: string, parameters?: any, models?: any) {
            return new Promise<void>((resolve) => {
                let _pageName = this._body + "/" + pageName;

                if(_pageName == this.body) {
                    return resolve(this._pages[_pageName]);
                }
                
                let page: Page = this.pages[_pageName];
    
                if(!page) {
                    console.error("an error occurred during open page '" + pageName + "': page not found");
                    
                    return resolve();
                }

                page.draw(parameters, models).then(() => {
                    resolve();
                }, (error: any) => {
                    console.error("an error occurred during open page '" + pageName + "'");
    
                    resolve();
                });
            });
        }
        
        refresh(pageName: string, parameters?: any, models?: any) {
            return new Promise<void>((resolve) => {
                let _pageName = this._body + "/" + pageName;
                
                if(_pageName == this.body) {
					return resolve(this._pages[_pageName]);
				}
				
				let page: Page = this.pages[_pageName];
	
				if(!page) {
                    console.error("an error occurred during refresh page '" + pageName + "': page not found");
                    
                    return resolve();
                }

                page.redraw(parameters, models).then(() => {
                    resolve();
                }, (error: any) => {
                    console.error("an error occurred during refresh page '" + pageName + "'");
    
                    resolve();
                });
            });
        }

        nextGroupStep(pageName: string, parameters?: any, models?: any) {
            return new Promise<void>((resolve) => {
                let _pageName = this._body + "/" + pageName;

                if(_pageName == this.body) {
					return resolve(this._pages[_pageName]);
				}
				
				let page: Page = this.pages[_pageName];
	
				if(!page) {
                    console.error("an error occurred during next step of page '" + pageName + "': page not found");
                    
                    return resolve();
				}

                page.nextStep(parameters, models).then(() => {
                    resolve();
                }, (error: any) => {
                    console.error("an error occurred during next step of page '" + pageName + "'");
    
                    resolve();
                });
            });
        }

        previousGroupStep(pageName: string, parameters?: any, models?: any) {
            return new Promise<void>((resolve) => {
                let _pageName = this._body + "/" + pageName;

                if(_pageName == this.body) {
					return resolve(this._pages[_pageName]);
				}
				
				let page: Page = this.pages[_pageName];
	
				if(!page) {
                    console.error("an error occurred during previous step of page '" + pageName + "': page not found");
                    
                    return resolve();
				}

                page.previousStep(parameters, models).then(() => {
                    resolve();
                }, (error: any) => {
                    console.error("an error occurred during previous step of page '" + pageName + "'");
    
                    resolve();
                });
            });
        }

        openGroupPageByIndex(pageName: string, index: number, parameters?: any, models?: any) {
            return new Promise<void>((resolve) => {
                let _pageName = this._body + "/" + pageName;

                if(_pageName == this.body) {
					return resolve(this._pages[_pageName]);
				}
				
				let page: Page = this.pages[_pageName];
	
				if(!page) {
                    console.error("an error occurred during open group page by index '" + pageName + "': page not found");
                    
                    return resolve();
				}

                page.openGroupPageByIndex(this, index, parameters, models).then(() => {
                    resolve();
                }, (error: any) => {
                    console.error("an error occurred during open group page by index '" + pageName + "'");
    
                    resolve();
                });
            });
        }

        openGroupPage(pageName: string, pageTarget: string, parameters?: any, models?: any) {
            return new Promise<void>((resolve) => {
                let _pageName = this._body + "/" + pageName;

                if(_pageName == this.body) {
					return resolve(this._pages[_pageName]);
				}
				
				let page: Page = this.pages[_pageName];
	
				if(!page) {
                    console.error("an error occurred during open group page '" + pageName + "': page not found");
                    
                    return resolve();
                }
                
                let target: string = this.body + "/" + page.path + "/" + pageTarget;

                page.openGroupPage(this, target, parameters, models).then(() => {
                    resolve();
                }, (error: any) => {
                    console.error("an error occurred during open group page '" + pageName + "'");
    
                    resolve();
                });
            });
        }

        resetGroupPage(pageName: string) {
            let _pageName = this._body + "/" + pageName;

            if(_pageName == this.body) {
                return;
            }
            
            let page: Page = this.pages[_pageName];

            if(!page) {
                console.error("an error occurred during reset group page '" + pageName + "': page not found");
            }

            page.groupIndex = 0;
        }

        getGroupCount(pageName: string) {
            let _pageName = this._body + "/" + pageName;
            
            let page: Page = this.pages[_pageName];

            if(!page) {
                console.error("an error occurred during get group count of page '" + pageName + "': page not found");
            }

            return page.group.length;
        }

        getGroupIndex(pageName: string) {
            let _pageName = this._body + "/" + pageName;
            
            let page: Page = this.pages[_pageName];

            if(!page) {
                console.error("an error occurred during get group index of page '" + pageName + "': page not found");
            }

            return page.groupIndex;
        }

        isFirstGroupStep(pageName: string) {
            let _pageName = this._body + "/" + pageName;
            
            let page: Page = this.pages[_pageName];

            if(!page) {
                console.error("an error occurred during check first group step of page '" + pageName + "': page not found");
            }

            return page.groupIndex == 0;
        }

        isLastGroupStep(pageName: string) {
            let _pageName = this._body + "/" + pageName;
            
            let page: Page = this.pages[_pageName];

            if(!page) {
                console.error("an error occurred during check last group step of page '" + pageName + "': page not found");
            }

            return page.groupIndex == page.group.length - 1;
        }

        setNextGroupStepEnabled(pageName: string, enabled: boolean) {
            let _pageName = this._body + "/" + pageName;
            
            let page: Page = this.pages[_pageName];

            if(!page) {
                console.error("an error occurred during set next group step enabled of page '" + pageName + "': page not found");
            }

            page.setNextGroupStepEnabled(this, enabled);
        }

        isNextGroupStepEnabled(pageName: string) {
            let _pageName = this._body + "/" + pageName;
            
            let page: Page = this.pages[_pageName];

            if(!page) {
                console.error("an error occurred during check next group step enabled of page '" + pageName + "': page not found");
            }

            return page.isNextGroupStepEnabled(this);
        }

        setPreviousGroupStepEnabled(pageName: string, enabled: boolean) {
            let _pageName = this._body + "/" + pageName;
            
            let page: Page = this.pages[_pageName];

            if(!page) {
                console.error("an error occurred during set previous group step enabled of page '" + pageName + "': page not found");
            }

            page.setPreviousGroupStepEnabled(this, enabled);
        }

        isPreviousGroupStepEnabled(pageName: string) {
            let _pageName = this._body + "/" + pageName;
            
            let page: Page = this.pages[_pageName];

            if(!page) {
                console.error("an error occurred during check previous group step enabled of page '" + pageName + "': page not found");
            }

            return page.isPreviousGroupStepEnabled(this);
        }
        
        close(pageName: string, parameters: any, models?: any) {
            return new Promise<void>((resolve) => {
                let _pageName = this._body + "/" + pageName;
                let page: Page = this.pages[_pageName];
    
                if(!page) {
                    console.error("an error occured during close page: page '" + pageName + "' not found");
                    
                    return resolve();
                }
                
                page.close(parameters, models).then(() => {
                    resolve();
                }, (error: any) => {
                    console.error("an error occurred during close page '" + pageName + "'");
    
                    resolve();
                });
            });
        }
        
        trigger(event: any, data: any) {
            let paths = [];
    
            if(this._handlers[event]) {
                paths = this._handlers[event];
            }
    
            for(let h=0; h<paths.length; h++) {
                let handlerPage = this.pages[paths[h]];
    
                let eventObject = {
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
            let path = window.location.href;
    
            let paths = path.split("/");
    
            if(paths.length > 2) {
                let basePath = "/";
    
                for(let i=3; i<paths.length; i++) {
                    let qualifyPaths = paths[i].split("?");
                    
                    basePath += qualifyPaths[0];
                }
                
                return basePath;
            }
    
            return "/";
        }

        addBody(name: string) {
            let app: App = new App(this);

            this._body = name;
            this._home = name;

            let body: Page = new Page(this, app, name, null, null, "", this._body, "", null, [], [], [], [], [], "", [], null, false, [], [], null);

            this._pages[this._body] = body;
        }

        addPage(pageName: string, hidden: any, showed: any, action: string, pagePath: string, container: string, view: string, controllers: any[], replace: any[], append: any[], commit: any[], group: any[], unwind: string, events: string[], parameters: any, isWidget: boolean, styles: string[], scripts: string[], models: any, appRootPath: string): Page {
            let bodyRegexp = new RegExp("^(" + this.body + "/)");
			let pathContainer = container.replace(bodyRegexp, "");

            let app: App = new App(this);

            if(isWidget) {
                let rootPath = appRootPath.replace(bodyRegexp, "");

                app.rootPath = rootPath + "/";
            }

            let relativePath = pathContainer + "/" + pageName;

            if(pathContainer == this.body) {
                relativePath = pageName;
            }

            this._pages[pagePath] = new Page(this, app, pageName, hidden, showed, action, container, relativePath, view, controllers, replace, append, commit, group, unwind, events, parameters, isWidget, styles, scripts, models);

            return this._pages[pagePath];
        }

        addSurrogate(name: string, path: string, containerPath: string, page: Page) {
            let replaceChildren = this.createSurrogates(path, page.replace);
            let appendChildren = this.createSurrogates(path, page.append);
            let commitChildren = this.createSurrogates(path, page.commit);
            let groupChildren = this.createSurrogates(path, page.group);

            let bodyRegexp = new RegExp("^(" + this.body + "/)");
            let relativePath = path.replace(bodyRegexp, "");

            this._pages[path] = new Page(this, page.app, name, page.hidden, page.showed, page.action, containerPath, relativePath, page.view, page.controllers, replaceChildren, appendChildren, commitChildren, groupChildren, page.unwind, page.events, page.parameters, page.isWidget, page.styles, page.scripts, page.models);

            return this._pages[path];
        }

        createSurrogates(path: string, pagesPath: string[]) {
            let surrogates = [];
			
			for(let i=0; i<pagesPath.length; i++) {
                let page: Page = this.pages[pagesPath[i]];
                let pagePath = path + "/" + page.name;

				surrogates.push(pagePath);

				this.addSurrogate(page.name, pagePath, path, page);
            }

			return surrogates;
        }

        getUrlParams(url: string) {
			let queryString = url.split("?");

			let query = "";

			if(queryString.length < 2) {
				return null;
			}

			query = queryString[1];
			
			let vars = query.split("&");
			let queryObject: any = {};

			for (let i=0; i<vars.length; i++) {
				let pair = vars[i].split("=");
				let key = decodeURIComponent(pair[0]);
				let value = decodeURIComponent(pair[1]);

				if(typeof queryObject[key] === "undefined") {
					queryObject[key] = decodeURIComponent(value);
				}
				else if (typeof queryObject[key] === "string") {
					let arr = [queryObject[key], decodeURIComponent(value)];
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
    Singlefin: SinglefinModule.Singlefin;
}

window.Singlefin = window.Singlefin || SinglefinModule.Singlefin;