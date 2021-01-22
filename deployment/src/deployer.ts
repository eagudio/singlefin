declare const require: any;

const fs = require('fs');
const path = require('path');
declare const __dirname: any;
declare const Buffer: any;


export module SinglefinDeployment {
    export class Deployer {
        private _serverBundle: any = {};
        private _bundles: any = {};
        private _paths: any = {};
        private _handlerMap: any = {};
        

        make(schemasFolderPath: string, targetsFolderPath: string, targetsServerFolderPath?: string) {
            console.log("build bundles...");

            fs.readdirSync(schemasFolderPath).forEach((schemaPath: string) => {
                var schemaName = path.basename(schemaPath, '.json');
                var appExtension = path.extname(schemaPath);
                
                if(appExtension == ".json") {
                    var schemaFullPath = path.join(schemasFolderPath, schemaPath);

                    this.makeBundle(schemaName, schemaFullPath, targetsFolderPath, targetsServerFolderPath);
                }
            });

            console.log("all bundles builded!");
        }

        makeBundle(schemaName: string, schemaPath: any, targetPath: string, serverTargetPath?: string) {
            console.log("read schema '" + schemaPath + "'...");
            
            var schema = require(schemaPath);

            this._paths = schema.paths;

            if(serverTargetPath) {
                this.makeServerBundle(schema.server, schemaName, serverTargetPath);
            }

            this.bundleApps(schema.apps, schemaName, targetPath);
        }

        makeServerBundle(serverSchema: any, schemaName: string, targetPath: string) {
            if(!serverSchema) {
                return;
            }

            this._serverBundle.options = serverSchema.options;

            this.bundleServerPublic(this._serverBundle.options.public);

            this.bundleServerRoutes(serverSchema.routes);

            var targetFullPath = path.format({
                dir: targetPath,
                name: schemaName + "_server",
                ext: '.js'
            });

            console.log(targetFullPath);

            this.saveServerBundle(targetFullPath, this._serverBundle);
        }

        bundleServerPublic(publicSchema: any) {
            if(!publicSchema) {
                return;
            }

            if(publicSchema.path) {
                publicSchema.path = this.normalizePath(publicSchema.path, this._paths);
            }
        }

        bundleServerRoutes(routeSchemas: any[]) {
            if(!routeSchemas) {
                return;
            }

            for(var i=0; i<routeSchemas.length; i++) {
                this.bundleServerRouteHandler(routeSchemas[i]);
            }

            this._serverBundle.routes = routeSchemas;
        }

        bundleServerRouteHandler(routeSchema: any) {
            if(!routeSchema.handler) {
                return;
            }

            var fullRouteHandlerPath = this.normalizePath(routeSchema.handler, this._paths);

            this._handlerMap[routeSchema.handler] = this.readFile(fullRouteHandlerPath, 'utf8');
        }

        bundleApps(apps: any, schemaName: string, targetPath: string) {
            for(var key in apps) {
                var app = apps[key];

                this._bundles[key] = {};

                this.bundleApp(app, this._bundles[key]);

                var targetFullPath = path.format({
                    dir: targetPath,
                    name: schemaName + "_" + key,
                    ext: '.js'
                });
    
                console.log(targetFullPath);
    
                this.saveBundle(key, targetFullPath, this._bundles[key]);
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
            page.models = _page.models;
            page.list = _page.list;

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

            if(_page.group) {
                page.group = this.bundlePageMethod(_page.group);
            }

            if(_page.unwind) {
                page.unwind = this.bundlePageMethod(_page.unwind);
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
            var filepath = this.normalizePath(filePath, this._paths);

            var fileContent: string = this.readFile(filepath);
            
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
            var bundleContent = JSON.stringify(bundle, null, "\t");

            for(var key in this._handlerMap) {
                var regex = new RegExp('"' + key + '"', "g");

                bundleContent = bundleContent.replace(regex, this._handlerMap[key] + "\n");
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
        
        normalizePath(path: string, pathsMap: any): string {
            if(!pathsMap) {
                return path;
            }

            var pathMarkup = this.resolvePath(path);

            if(pathMarkup) {
                var itemPath = pathsMap[pathMarkup[1]];

                return path.replace(pathMarkup[0], itemPath);
            }

            return path;
        }

        normalizePaths(paths: string[], pathsMap: any): string[] {
            var normalizedPaths: string[] = [];
            
            if(!pathsMap) {
                return paths;
            }

            for(var i=0; i<paths.length; i++) {
                normalizedPaths.push(this.normalizePath(paths[i], pathsMap));
            }

            return normalizedPaths;
        }
        
        resolvePath(path: string) {
            var pathRegExp = new RegExp("@([a-z0-9_-]+)");
            
            var pathMarkup = pathRegExp.exec(path);
    
            return pathMarkup;
        }
    }
}