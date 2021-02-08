const fs = require('fs');
const path = require('path');
declare const __dirname: any;
declare const Buffer: any;


export module SinglefinDeployment {
    export class Deployer {
        private _serverInstanceMap: any = {};
        

        make(schemasPath: string) {
            console.log("build bundles...");

            var schema = require(schemasPath);

            this.bundleDomains(schema.domains);
            this.bundleApps(schema.apps);

            console.log("all bundles builded!");
        }

        bundleDomains(domainsSchema: any) {
            if(!domainsSchema) {
                return;
            }

            for(var key in domainsSchema) {
                var domain = {};

                this.bundleServerDomain(domain, domainsSchema[key]);

                console.log(domainsSchema[key].bundle);

                this.saveServerBundle(domainsSchema[key].bundle, domain);
            }
        }

        bundleServerDomain(domain: any, domainSchema: any) {
            domain.path = domainSchema.path;
            domain.options = domainSchema.options;
            domain.router = domainSchema.router;
            domain.static = domainSchema.static;
            domain.events = domainSchema.events;
            domain.models = {};
            domain.services = {};
            domain.routes = {};

            this.bundleServerModels(domain.models, domainSchema.models);
            this.bundleServerServices(domain.services, domainSchema.services);
            this.bundleServerRoutes(domain.routes, domainSchema.routes, domainSchema.services);
        }

        bundleServerModels(models: any, modelsSchema: any) {
            if(!modelsSchema) {
                return;
            }

            for(var key in modelsSchema) {
                models[key] = modelsSchema[key];

                this.addServerInstance(modelsSchema[key]);
            }
        }

        bundleServerServices(services: any, servicesSchema: any) {
            if(!servicesSchema) {
                return;
            }

            for(var key in servicesSchema) {
                services[key] = servicesSchema[key];

                this.addServerInstance(servicesSchema[key].handler);
            }
        }

        bundleServerRoutes(routes: any, routesSchema: any, servicesSchema: any) {
            if(!routesSchema) {
                return;
            }

            for(var key in routesSchema) {
                routes[key] = {};

                routes[key].service = routesSchema[key].service;
                routes[key].method = routesSchema[key].method;
                routes[key].models = routesSchema[key].models;
                routes[key].events = routesSchema[key].events;
                routes[key].from = routesSchema[key].from;

                if(routesSchema[key].service) {
                    if(servicesSchema[routesSchema[key].service]) {
                        if(servicesSchema[routesSchema[key].service].deployer) {
                            var Deployer = require(servicesSchema[routesSchema[key].service].deployer);
                        
                            var service = new Deployer();
        
                            service.deploy(this, routes[key], routesSchema[key]);
                        }
                    }
                }
            }
        }

        addServerInstance(instancePath: string) {
            this._serverInstanceMap[instancePath] = this.readFile(instancePath, 'utf8');
        }

        bundleApps(appsSchema: any) {
            for(var key in appsSchema) {
                var app = {};

                this.bundleApp(appsSchema[key], app);
    
                console.log(appsSchema[key].bundle);
    
                this.saveBundle(key, appsSchema[key].bundle, app);
            }
        }

        bundleApp(app: any, bundle: any) {
            bundle.homepage = app.homepage;

			this.bundleResources(app.resources, bundle);
            this.bundleModels(app.models, bundle);
            this.bundleWidgets(app.widgets, bundle);
            this.bundlePages(app.pages, bundle);
        }
        
        bundleResources(resources: any, bundle: any) {
            bundle.resources = {};

            if(!resources) {
                return;
            }

			for (var languageKey in resources) {
                bundle.resources[languageKey] = {};

				for (var resourceKey in resources[languageKey]) {
                    var fileBundle = this.bundleFile(resources[languageKey][resourceKey]);

                    bundle.resources[languageKey][resourceKey] = fileBundle;
				}
			}
        }

        bundleModels(models: any, bundle: any) {
            bundle.models = {};

            if(!models) {
                return;
            }

			for (var model in models) {
                bundle.models[model] = {};

                var fileBundle = this.bundleFile(models[model]);

                bundle.models[model] = fileBundle;
			}
        }

        bundleWidgets(widgets: any, bundle: any) {
            bundle.widgets = {};

            if(!widgets) {
                return;
            }

			for (var widget in widgets) {
                bundle.widgets[widget] = {};

                var pageBundle = this.bundlePage(widgets[widget]);

                bundle.widgets[widget] = pageBundle;
			}
        }

        bundlePages(pages: any, bundle: any) {
            bundle.pages = {};

            if(!pages) {
                return;
            }

			for (var page in pages) {
                bundle.pages[page] = {};

                var pageBundle = this.bundlePage(pages[page]);

                bundle.pages[page] = pageBundle;
			}
        }

        bundlePage(_page: any) {
            var page: any = {};

            page.events = _page.events;
            page.parameters = _page.parameters;
            page.hidden = _page.hidden;
            page.models = _page.models;
            page.unwind = _page.unwind;

            if(_page.view) {
                page.view = this.bundleView(_page.view);
            }

            if(_page.controllers) {
                page.controllers = this.bundleControllers(_page.controllers);
            }

            if(_page.styles) {
                page.styles = this.bundleStyles(_page.styles);
            }

            if(_page.scripts) {
                page.scripts = this.bundleScripts(_page.scripts);
            }

            if(_page.append) {
                page.append = this.bundlePageMethod(_page.append);
            }

            if(_page.replace) {
                page.replace = this.bundlePageMethod(_page.replace);
            }

            if(_page.commit) {
                page.commit = this.bundlePageMethod(_page.commit);
            }

            if(_page.group) {
                page.group = this.bundlePageMethod(_page.group);
            }

            return page;
        }

        bundleView(view: any): string {
            return this.bundleFile(view);
        }

        bundleControllers(_controllers: string[]): string[] {
            var controllers: string[] = [];

            for(var i=0; i<_controllers.length; i++) {
                var controller = this.bundleFile(_controllers[i]);
                
                controllers.push(controller);
            }

            return controllers;
        }

        bundleStyles(_styles: string[]): string[] {
            var styles: string[] = [];

            for(var i=0; i<_styles.length; i++) {
                var style = this.bundleFile(_styles[i]);
                
                styles.push(style);
            }

            return styles;
        }

        bundleScripts(_scripts: string[]): string[] {
            var scripts: string[] = [];

            for(var i=0; i<_scripts.length; i++) {
                var script = this.bundleFile(_scripts[i]);
                
                scripts.push(script);
            }

            return scripts;
        }

        bundlePageMethod(_method: any[]): any[] {
            var method: any[] = [];

            for(var i=0; i<_method.length; i++) {
                var pages = _method[i];

                for(var _page in pages) {
                    var bundlePage = this.bundlePage(pages[_page]);

                    var page: any = {};
                    
                    page[_page] = bundlePage;

                    method.push(page);
                }
            }

            return method;
        }

        bundleFile(filePath: string): string {
            var fileContent: string = this.readFile(filePath);
            
            var base64FileContent: string = this.encodeBase64(fileContent);

            return base64FileContent;
        }

        bundleServiceRequest(request: any) {
            var service = request["service"];

            if(!service) {
                return request;        
            }

            service = {
                type: "POST",
                url: "", //TODO: l'url viene generato in automatico e assegnato anche al servizio server
            };
        }

        encodeBase64(data: string): string {
            return Buffer.from(data).toString('base64');
        }

        readFile(path: string, encoding?: string): string {
            try {
                return fs.readFileSync(path, encoding);
            }
            catch(ex) {
                console.error("an error occurred during read file '" + path + "': " + ex);

                return "";
            }
        }

        saveServerBundle(filePath: string, bundle: any) {
            var bundleContent = JSON.stringify(bundle);

            for(var key in this._serverInstanceMap) {
                var regex = new RegExp('"' + key + '"', "g");

                bundleContent = bundleContent.replace(regex, this._serverInstanceMap[key]);
            }

            var script = `
                class SinglefinServerBundle{
                    getBundle() {
                        return ` + bundleContent + `;
                    }
                }
                module.exports = new SinglefinServerBundle();
            `;

            fs.writeFileSync(filePath, script);
        }

        saveBundle(appName: string, filePath: string, bundle: any) {
            var bundleContent = JSON.stringify(bundle);

            var script = `var homepage=document.currentScript.getAttribute('homepage');var singlefin_` + appName + ` = new Singlefin(` + bundleContent + `,homepage);`;

            fs.writeFileSync(filePath, script);
        }
        
        resolvePath(path: string) {
            var pathRegExp = new RegExp("@([a-z0-9_-]+)");
            
            var pathMarkup = pathRegExp.exec(path);
    
            return pathMarkup;
        }
    }
}