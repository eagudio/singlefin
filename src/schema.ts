declare var $: any;

module Browser {
    export class Schema {
        load(schema: any, browser: Browser) {
            if(!schema) {
				return Promise.reject("schema cannot be null or undefined");
			}
	
			if(!schema.body) {
				return Promise.reject("schema body missing");
            }
    
            var _instances: any[] = [];
			var body = schema.body;

			if(body.view) {
				browser.pages.__body.htmlElement = null;
				browser.pages.__body.view = body.view;

				_instances.push(body.view);
			}

			if(body.controllers && Array.isArray(body.controllers)) {
				browser.pages.__body.controllers = body.controllers;
				
				for(var i=0; i<body.controllers.length; i++) {
					_instances.push(body.controllers[i]);
				}
			}

			if(body.models) {
				browser.pages.__body.models = body.models;

				for (var modelKey in body.models) {
					_instances.push(body.models[modelKey]);
				}
			}

			browser.pages.__body.events = body.events;

			this.addHandlers(browser.body, browser);
			
			this.processSchema("append", browser.body, body.append, browser);
			this.processSchema("replace", browser.body, body.replace, browser);
			this.processSchema("unwind", browser.body, body.unwind, browser);

			return browser._private.loadInstances();
        }

        addHandlers(pagePath: string, browser: Browser) {
			var _page: any = browser.pages[pagePath];

			if(_page.events) {
				for(var h=0; h<_page.events.length; h++) {
					if(!browser.handlers[_page.events[h]]) {
						browser.handlers[_page.events[h]] = [];
					}

					browser.handlers[_page.events[h]].push(pagePath);
				}
				
			}
        }
        
        processSchema(action: string, containerName: string, schema: any, browser: Browser) {
			if(!action) {
				return;
			}

			if(!containerName) {
				throw "container missed";
			}

			if(schema == null) {
				return;
			}

			for(var i=0; i<schema.length; i++) {
				var pageName = Object.keys(schema[i])[0];
				var pagePath = containerName + "/" + pageName;
				var page = schema[i][pageName];

				var replaceChildren = this.processChildrenSchema(pagePath, page.replace);
				var appendChildren = this.processChildrenSchema(pagePath, page.append);
				var unwindChildren = this.processChildrenSchema(pagePath, page.unwind);

				browser.addPage(action, pageName, pagePath, containerName, page.view, page.htmlview, page.controllers, page.models, replaceChildren, appendChildren, unwindChildren, page.key, page.events, page.parameters);

				this.processSchema("replace", pagePath, page.replace, browser);
				this.processSchema("append", pagePath, page.append, browser);
				this.processSchema("unwind", pagePath, page.unwind, browser);

				this.addHandlers(pagePath, browser);
			}
        }
        
		processChildrenSchema(parentPagePath: string, childrenSchema: any[]) {
			var children: any[] = [];
			
			if(!childrenSchema) {
				return children;
			}

			for(var i=0; i<childrenSchema.length; i++) {
				var childPagePath = parentPagePath + "/" + Object.keys(childrenSchema[i])[0];

				children.push(childPagePath);
			}

			return children;
        }
    }
}