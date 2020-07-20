declare var $: any;

module SinglefinModule {
    export class ConfigLoader {
        load(config: any, singlefin: Singlefin) {
			var resources = config.resources;
			var styles = config.styles;
			var schema = config.schema;
			
			if(!schema) {
				throw "schema cannot be null or undefined";
			}

			this.processResources(resources, singlefin);
			
			singlefin.styles = styles;
	
			var bodyName = Object.keys(schema)[0];

			singlefin.addBody(bodyName);

			var body = schema[bodyName];

			if(body.view) {
				singlefin.getBody().htmlElement = null;
				singlefin.getBody().view = "text!" + body.view;

				singlefin.instances.push(singlefin.getBody().view);
			}

			if(body.controllers && Array.isArray(body.controllers)) {
				singlefin.getBody().controllers = body.controllers;
				
				for(var i=0; i<body.controllers.length; i++) {
					singlefin.instances.push(body.controllers[i]);
				}
			}

			if(body.models) {
				singlefin.getBody().models = body.models;

				for (var modelKey in body.models) {
					singlefin.instances.push(body.models[modelKey]);
				}
			}

			singlefin.getBody().events = body.events;

			this.addHandlers(singlefin.body, singlefin);
			
			this.processSchema("append", singlefin.body, body.append, singlefin);
			this.processSchema("replace", singlefin.body, body.replace, singlefin);
			this.processSchema("group", singlefin.body, body.group, singlefin);
			this.processSchema("unwind", singlefin.body, body.unwind, singlefin);
		}

		processResources(resources: any, singlefin: Singlefin) {
			singlefin.resources = resources;
			
			for (var key in resources) {
				singlefin.instances.push(resources[key]);
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
        
        processSchema(action: string, containerName: string, schema: any, singlefin: Singlefin) {
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
				var page = schema[i][pageName];

				var disabled: boolean = false;

				if(page.parameters) {
					disabled = page.parameters.disabled;
				}

				var pagePath = containerName + "/" + pageName;

				var replaceChildren = this.processChildrenSchema(pagePath, page.replace);
				var appendChildren = this.processChildrenSchema(pagePath, page.append);
				var groupChildren = this.processChildrenSchema(pagePath, page.group);
				var unwindChildren = this.processChildrenSchema(pagePath, page.unwind);

				singlefin.addPage(pageName, disabled, action, pagePath, containerName, page.view, page.controllers, page.models, replaceChildren, appendChildren, groupChildren, unwindChildren, page.key, page.events, page.parameters);

				this.processSchema("replace", pagePath, page.replace, singlefin);
				this.processSchema("append", pagePath, page.append, singlefin);
				this.processSchema("group", pagePath, page.group, singlefin);
				this.processSchema("unwind", pagePath, page.unwind, singlefin);

				this.addHandlers(pagePath, singlefin);
			}
        }
        
		processChildrenSchema(parentPagePath: string, childrenSchema: any[]) {
			var children: any[] = [];
			
			if(!childrenSchema) {
				return children;
			}

			for(var i=0; i<childrenSchema.length; i++) {
				var childPageName = Object.keys(childrenSchema[i])[0];
				
				var childPagePath = parentPagePath + "/" + childPageName;

				children.push(childPagePath);
			}

			return children;
        }
    }
}