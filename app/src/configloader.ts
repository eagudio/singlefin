declare var $: any;

module SinglefinModule {
    export class ConfigLoader {
        load(config: any, singlefin: Singlefin) {
			var resources = config.resources;
			var models = config.models;
			var pages = config.pages;
			
			if(!pages) {
				throw "pages cannot be null or undefined";
			}

			this.processResources(resources, singlefin);

			if(models) {
				for (var modelKey in models) {
					singlefin.models[modelKey] = this.unbundleJavascriptObject(models[modelKey]);
				}
			}
	
			var bodyName = Object.keys(pages)[0];

			singlefin.addBody(bodyName);

			var body = pages[bodyName];

			if(body.view) {
				singlefin.getBody().htmlElement = null;
			}

			singlefin.getBody().view = this.unbundleView(body.view);
			singlefin.getBody().controllers = this.unbundleJavascriptObjects(body.controllers);
			singlefin.getBody().styles = this.unbundleFiles(body.styles);
			singlefin.getBody().scripts = this.unbundleFiles(body.scripts);

			singlefin.getBody().events = body.events;

			this.addHandlers(singlefin.body, singlefin);
			
			this.processPages("append", singlefin.body, body.append, config.widgets, singlefin, false, singlefin.body);
			this.processPages("replace", singlefin.body, body.replace, config.widgets, singlefin, false, singlefin.body);
			this.processPages("group", singlefin.body, body.group, config.widgets, singlefin, false, singlefin.body);
			this.processPages("unwind", singlefin.body, body.unwind, config.widgets, singlefin, false, singlefin.body);
		}

		processResources(resources: any, singlefin: Singlefin) {
			singlefin.resources = {};

			for (var languageKey in resources) {
				singlefin.resources[languageKey] = {};

				for (var resourceKey in resources[languageKey]) {
					singlefin.resources[languageKey][resourceKey] = this.unbundleJavascriptObject(resources[languageKey][resourceKey]);
				}
			}
		}

        addHandlers(pagePath: string, singlefin: Singlefin) {
			var _page: any = singlefin.pages[pagePath];

			if(_page.events) {
				for(var h=0; h<_page.events.length; h++) {
					if(!singlefin.handlers[_page.events[h]]) {
						singlefin.handlers[_page.events[h]] = [];
					}

					singlefin.handlers[_page.events[h]].push(pagePath);
				}
				
			}
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
					page.appRootPath = pagePath;
				}

				var replaceChildren = this.processChildrenPage(pagePath, page.replace);
				var appendChildren = this.processChildrenPage(pagePath, page.append);
				var groupChildren = this.processChildrenPage(pagePath, page.group);
				var unwindChildren = this.processChildrenPage(pagePath, page.unwind);

				page.view = this.unbundleView(page.view);
				page.controllers = this.unbundleJavascriptObjects(page.controllers);
				page.styles = this.unbundleFiles(page.styles);
				page.scripts = this.unbundleFiles(page.scripts);

				singlefin.addPage(pageName, disabled, action, pagePath, containerName, page.view, page.controllers, replaceChildren, appendChildren, groupChildren, unwindChildren, page.key, page.events, page.parameters, page.isWidget, page.styles, page.scripts, page.appRootPath);

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

		unbundleJavascriptObjects(_objects: string[]): any {
			if(!_objects) {
				return;
			}

			var objects: any[] = [];
			
			for(var i=0; i<_objects.length; i++) {
				objects.push(this.unbundleJavascriptObject(_objects[i]));
			};

			return objects;
		}

		unbundleJson(json: string): string {
			var jsonString = this.decodeBase64(json);

			return JSON.parse(jsonString);
		}

		unbundleJavascriptObject(javascriptObject: string): string {
			var controllerContent = this.decodeBase64(javascriptObject);
			
			var define = (_obj: any) => {
				if(typeof _obj === "function") {
					return _obj();
				}

				return _obj;
			};

			var obj = eval(controllerContent);

			//TODO: impostare come nell'esempio qui sotto
			/*var exports: any;
			eval(`
				class Test {
					hello() {
						console.log("hello!");
					}
				}

				exports = Test;
			`);
			console.log(exports);
			var c = new exports();
			c.hello();*/
			
			return obj;
		}

		decodeBase64(data: string) {
			return decodeURIComponent(escape(atob(data)));
		}
    }
}
