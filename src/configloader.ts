declare var $: any;

module SinglefinModule {
    export class ConfigLoader {
        load(config: any, singlefin: Singlefin) {
			var resources = config.resources;
			var styles = config.styles;
			var models = config.models;
			var pages = config.pages;
			
			if(!pages) {
				throw "pages cannot be null or undefined";
			}

			this.processResources(resources, singlefin);
			
			singlefin.styles = styles;

			if(models) {
				singlefin.models = models;

				for (var modelKey in models) {
					singlefin.instances.push(models[modelKey]);
				}
			}
	
			var bodyName = Object.keys(pages)[0];

			singlefin.addBody(bodyName);

			var body = pages[bodyName];

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

			singlefin.getBody().events = body.events;

			this.addHandlers(singlefin.body, singlefin);
			
			this.processPages("append", singlefin.body, body.append, singlefin);
			this.processPages("replace", singlefin.body, body.replace, singlefin);
			this.processPages("group", singlefin.body, body.group, singlefin);
			this.processPages("unwind", singlefin.body, body.unwind, singlefin);
		}

		processResources(resources: any, singlefin: Singlefin) {
			singlefin.resources = resources;

			for (var languageKey in resources) {
				for (var resourceKey in resources[languageKey]) {
					singlefin.instances.push(resources[languageKey][resourceKey]);
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
        
        processPages(action: string, containerName: string, pages: any, singlefin: Singlefin) {
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

				var disabled: boolean = false;

				if(page.parameters) {
					disabled = page.parameters.disabled;
				}

				var pagePath = containerName + "/" + pageName;

				var replaceChildren = this.processChildrenPage(pagePath, page.replace);
				var appendChildren = this.processChildrenPage(pagePath, page.append);
				var groupChildren = this.processChildrenPage(pagePath, page.group);
				var unwindChildren = this.processChildrenPage(pagePath, page.unwind);

				singlefin.addPage(pageName, disabled, action, pagePath, containerName, page.view, page.controllers, replaceChildren, appendChildren, groupChildren, unwindChildren, page.key, page.events, page.parameters);

				this.processPages("replace", pagePath, page.replace, singlefin);
				this.processPages("append", pagePath, page.append, singlefin);
				this.processPages("group", pagePath, page.group, singlefin);
				this.processPages("unwind", pagePath, page.unwind, singlefin);

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
    }
}