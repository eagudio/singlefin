declare var $: any;

module SinglefinModule {
    export class ConfigLoader {
		private _bodyName: string = "";
		private _modulesCode: string = "";


        load(config: any, singlefin: Singlefin) {
			var resources = config.resources;
			var models = config.models;
			var pages = config.pages;
			
			if(!pages) {
				throw "pages cannot be null or undefined";
			}

			this._bodyName = Object.keys(pages)[0];

			this.processResources(resources, singlefin);

			if(models) {
				var module = this.getModule(this._bodyName);
				module.models = {};

				for (var modelKey in models) {
					module.models[modelKey] = {};

					var path = "['" + this._bodyName + "'].models['" + modelKey + "']";

					module.models[modelKey] = this.unbundleJavascriptObject(path, "object", models[modelKey]);
				}

				singlefin.models = module.models;
			}

			singlefin.addBody(this._bodyName);

			var body = pages[this._bodyName];

			if(body.view) {
				singlefin.getBody().htmlElement = null;
			}

			singlefin.getBody().view = this.unbundleView(body.view);

			var module = this.getModule(this._bodyName);
			module.controllers = [];
			module.controllers = this.unbundleJavascriptObjects("['" + this._bodyName + "'].controllers", "array", body.controllers);
			singlefin.getBody().controllers = module.controllers;

			singlefin.getBody().styles = this.unbundleFiles(body.styles);
			singlefin.getBody().scripts = this.unbundleFiles(body.scripts);

			singlefin.getBody().events = this.processEvents(body.events);

			this.addHandlers(singlefin.body, singlefin);
			
			this.processPages("append", singlefin.body, body.append, config.widgets, singlefin, false, singlefin.body);
			this.processPages("replace", singlefin.body, body.replace, config.widgets, singlefin, false, singlefin.body);
			this.processPages("group", singlefin.body, body.group, config.widgets, singlefin, false, singlefin.body);
			this.processPages("unwind", singlefin.body, body.unwind, config.widgets, singlefin, false, singlefin.body);

			return this.loadModules();
		}

		processResources(resources: any, singlefin: Singlefin) {
			singlefin.resources = {};

			var module = this.getModule(this._bodyName);
			module.resources = {};

			for (var languageKey in resources) {
				module.resources[languageKey] = {};
				var path = "['" + this._bodyName + "'].resources['" + languageKey + "']";

				for (var resourceKey in resources[languageKey]) {
					path += "['" + resourceKey + "']";
					module.resources[languageKey][resourceKey] = this.unbundleJavascriptObject(path, "object", resources[languageKey][resourceKey]); //serve il path...
				}
			}

			singlefin.resources = module.resources;
		}

        addHandlers(pagePath: string, singlefin: Singlefin) {
			/*var _page: any = singlefin.pages[pagePath];

			if(_page.events) {
				for(var h=0; h<_page.events.length; h++) {
					if(!singlefin.handlers[_page.events[h]]) {
						singlefin.handlers[_page.events[h]] = [];
					}

					singlefin.handlers[_page.events[h]].push(pagePath);
				}
				
			}*/
        }
        
        processPages(action: string, containerName: string, pages: any, widgets: any, singlefin: Singlefin, isWidget: boolean, appRootPath: string) {
			if(!action) {
				return;
			}

			if(!containerName) {
				throw "container missed";
			}

			if(pages == null) {
				return;
			}

			for(var i=0; i<pages.length; i++) {
				var pageName = Object.keys(pages[i])[0];
				var page = pages[i][pageName];
				page.isWidget = isWidget;
				page.appRootPath = appRootPath;

				var disabled: boolean = false;

				if(page.parameters) {
					disabled = page.parameters.disabled;
				}

				var pagePath = containerName + "/" + pageName;

				if(page.widget) {
					page.isWidget = true;
					page.view = widgets[page.widget].view;
					page.controllers = widgets[page.widget].controllers;
					page.replace = widgets[page.widget].replace;
					page.append = widgets[page.widget].append;
					page.group = widgets[page.widget].group;
					page.unwind = widgets[page.widget].unwind;
					page.styles = widgets[page.widget].styles;
					page.scripts = widgets[page.widget].scripts;
					page.models = widgets[page.widget].models;
					page.appRootPath = pagePath;
				}

				var replaceChildren = this.processChildrenPage(pagePath, page.replace);
				var appendChildren = this.processChildrenPage(pagePath, page.append);
				var groupChildren = this.processChildrenPage(pagePath, page.group);
				var unwindChildren = this.processChildrenPage(pagePath, page.unwind);

				page.view = this.unbundleView(page.view);

				var module = this.getModule(pagePath);
				module.controllers = this.unbundleJavascriptObjects("['" + pagePath + "'].controllers", "array", page.controllers);
				page.controllers = module.controllers;

				page.styles = this.unbundleFiles(page.styles);
				page.scripts = this.unbundleFiles(page.scripts);
				page.events = this.processEvents(page.events);

				singlefin.addPage(pageName, disabled, action, pagePath, containerName, page.view, page.controllers, replaceChildren, appendChildren, groupChildren, unwindChildren, page.list, page.events, page.parameters, page.isWidget, page.styles, page.scripts, page.models, page.appRootPath);

				this.processPages("replace", pagePath, page.replace, widgets, singlefin, page.isWidget, page.appRootPath);
				this.processPages("append", pagePath, page.append, widgets, singlefin, page.isWidget, page.appRootPath);
				this.processPages("group", pagePath, page.group, widgets, singlefin, page.isWidget, page.appRootPath);
				this.processPages("unwind", pagePath, page.unwind, widgets, singlefin, page.isWidget, page.appRootPath);

				this.addHandlers(pagePath, singlefin);
			}
        }
        
		processChildrenPage(parentPagePath: string, childrenPage: any[]) {
			var children: any[] = [];
			
			if(!childrenPage) {
				return children;
			}

			for(var i=0; i<childrenPage.length; i++) {
				var childPageName = Object.keys(childrenPage[i])[0];
				
				var childPagePath = parentPagePath + "/" + childPageName;

				children.push(childPagePath);
			}

			return children;
		}

		processEvents(events: any) {
			for(var eventKey in events) {
                var event = events[eventKey];

                for(var i=0; i<event.length; i++) {
                    event[i] = this.bundleRequest(event[i]);
                }
            }
		}

		bundleRequest(eventHandler: any) {
            if(!eventHandler) {
                return eventHandler;
            }

            if(!eventHandler["request"]) {
                return eventHandler;
			}

			var route = Object.keys(eventHandler["request"])[0];
			var requestParameters = eventHandler["request"][route];

			eventHandler["request"][route].handler = new Request(requestParameters.data, requestParameters.result, requestParameters.then, requestParameters.catch);

            return eventHandler;
		}

		unbundleView(view: string): any {
			if(!view) {
				return;
			}
			
			return this.decodeBase64(view);
		}

		unbundleFiles(_files: string[]): any {
			if(!_files) {
				return;
			}

			var files: any[] = [];
			
			for(var i=0; i<_files.length; i++) {
				files.push(this.decodeBase64(_files[i]));
			};

			return files;
		}

		unbundleJson(json: string): string {
			var jsonString = this.decodeBase64(json);

			return JSON.parse(jsonString);
		}

		unbundleJavascriptObjects(path: string, moduleType: string, _objects: string[]): any {
			if(!_objects) {
				return;
			}

			var objects: any[] = [];
			
			for(var i=0; i<_objects.length; i++) {
				var object = this.unbundleJavascriptObject(path, moduleType, _objects[i]);

				if(object) {
					objects.push(object);
				}
			};

			return objects;
		}

		unbundleJavascriptObject(path: string, moduleType: string, javascriptObject: string): any {
			var controllerContent = this.decodeBase64(javascriptObject);
			
			if(controllerContent.startsWith("class")) {
				return this.addModuleCode(path, moduleType, controllerContent);
			}

			//TODO: workaround: tutti i moduli (controller, model, ecc.) devono essere convertiti in classi e il define va eliminato, così come l'eval!
			var define = (_obj: any) => {
				if(typeof _obj === "function") {
					return _obj();
				}

				return _obj;
			};

			var obj = eval(controllerContent);
			
			return obj;
		}

		decodeBase64(data: string) {
			return decodeURIComponent(escape(atob(data)));
		}

		getModule(path: string) {
			if(!Singlefin.moduleMap[path]) {
				Singlefin.moduleMap[path] = {};
			}

			return Singlefin.moduleMap[path];
		}

		addModuleCode(path: string, moduleType: string, code: string) {
			if(moduleType == "array") {
				this._modulesCode += `Singlefin.moduleMap` + path + `.push(new ` + code + `())\n`;
			}
			else {
				this._modulesCode += `Singlefin.moduleMap` + path + ` = new ` + code + `()\n`;
			}

			return null;
		}

		loadModules() {
			return new Promise((resolve, reject) => {
				var script = document.createElement("script");
				script.type = "text/javascript";

				this._modulesCode += `\nSinglefin.loadModuleCallbacks["` + this._bodyName + `"]();`;

				script.text = this._modulesCode;

				Singlefin.loadModuleCallbacks[this._bodyName] = (() => {
					resolve();
				});
	
				$('head').append(script);
			});
		}
    }
}
