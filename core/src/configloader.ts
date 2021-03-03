declare var $: any;

module SinglefinModule {
    export class ConfigLoader {
		private _bodyName: string = "";
		private _modulesCode: string = "";


        load(config: any, singlefin: Singlefin) {
			var models = config.models;
			var proxies = config.proxies;
			var pages = config.pages;
			
			if(!pages) {
				throw "pages cannot be null or undefined";
			}

			this._bodyName = Object.keys(pages)[0];

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

			if(proxies) {
				var module = this.getModule(this._bodyName);
				module.proxies = [];

				for(var i=0; i<proxies.length; i++) {
					var proxy: any = {};
					proxy.events = proxies[i].events;

					var path = "['" + this._bodyName + "'].proxies[" + i + "].proxy";

					proxy.proxy = this.unbundleJavascriptObject(path, "object", proxies[i].proxy);

					module.proxies.push(proxy);
				}

				singlefin.proxies = module.proxies;
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

			singlefin.getBody().events = body.events;
			singlefin.getBody().models = body.models;
			
			this.processPages("append", singlefin.body, body.append, config.widgets, singlefin, false, singlefin.body);
			this.processPages("replace", singlefin.body, body.replace, config.widgets, singlefin, false, singlefin.body);
			this.processPages("commit", singlefin.body, body.commit, config.widgets, singlefin, false, singlefin.body);
			this.processPages("group", singlefin.body, body.group, config.widgets, singlefin, false, singlefin.body);

			return this.loadModules();
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

				var pagePath = containerName + "/" + pageName;

				if(page.widget) {
					page.isWidget = true;
					page.view = widgets[page.widget].view;
					page.hidden = widgets[page.widget].hidden;
					page.showed = widgets[page.widget].showed;
					page.controllers = widgets[page.widget].controllers;
					page.replace = widgets[page.widget].replace;
					page.append = widgets[page.widget].append;
					page.commit = widgets[page.widget].commit;
					page.group = widgets[page.widget].group;
					page.unwind = widgets[page.widget].unwind;
					page.styles = widgets[page.widget].styles;
					page.scripts = widgets[page.widget].scripts;
					page.models = widgets[page.widget].models;
					page.appRootPath = pagePath;
				}

				var replaceChildren = this.processChildrenPage(pagePath, page.replace);
				var appendChildren = this.processChildrenPage(pagePath, page.append);
				var commitChildren = this.processChildrenPage(pagePath, page.commit);
				var groupChildren = this.processChildrenPage(pagePath, page.group);

				page.view = this.unbundleView(page.view);

				var module = this.getModule(pagePath);
				module.controllers = this.unbundleJavascriptObjects("['" + pagePath + "'].controllers", "array", page.controllers);
				page.controllers = module.controllers;

				page.styles = this.unbundleFiles(page.styles);
				page.scripts = this.unbundleFiles(page.scripts);
				page.events = page.events;
				page.models = page.models;

				singlefin.addPage(pageName, page.hidden, page.showed, action, pagePath, containerName, page.view, page.controllers, replaceChildren, appendChildren, commitChildren, groupChildren, page.unwind, page.events, page.parameters, page.isWidget, page.styles, page.scripts, page.models, page.appRootPath);

				this.processPages("replace", pagePath, page.replace, widgets, singlefin, page.isWidget, page.appRootPath);
				this.processPages("append", pagePath, page.append, widgets, singlefin, page.isWidget, page.appRootPath);
				this.processPages("commit", pagePath, page.commit, widgets, singlefin, page.isWidget, page.appRootPath);
				this.processPages("group", pagePath, page.group, widgets, singlefin, page.isWidget, page.appRootPath);
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
			var code = this.decodeBase64(javascriptObject);

			if(moduleType == "array") {
				this._modulesCode += `Singlefin.moduleMap` + path + `.push(new ` + code + `())\n`;
			}
			else {
				this._modulesCode += `Singlefin.moduleMap` + path + ` = new ` + code + `()\n`;
			}

			return null;
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

		loadModules() {
			return new Promise<void>((resolve, reject) => {
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
