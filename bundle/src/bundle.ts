const fs = require('fs');
declare const Buffer: any;


module SinglefinBundleModule {
    export class Bundle {
        private _schema: any = {};
        private _paths: any = {};
        

        make(schema: any, targetPath: string) {
            this._paths = schema.paths;

            this._schema.homepage = schema.homepage;

			this.bundleResources(schema.resources);
            this.bundleModels(schema.models);
            this.bundleWidgets(schema.widgets);
            this.bundlePages(schema.pages);
            
            this.save(targetPath);
        }
        
        bundleResources(resources: any) {
            this._schema.resources = {};

            if(!resources) {
                return;
            }

			for (var languageKey in resources) {
                this._schema.resources[languageKey] = {};

				for (var resourceKey in resources[languageKey]) {
                    var fileBundle = this.bundleFile(resources[languageKey][resourceKey]);

                    this._schema.resources[languageKey][resourceKey] = fileBundle;
				}
			}
        }

        bundleModels(models: any) {
            this._schema.models = {};

            if(!models) {
                return;
            }

			for (var model in models) {
                this._schema.models[model] = {};

                var fileBundle = this.bundleFile(models[model]);

                this._schema.models[model] = fileBundle;
			}
        }

        bundleWidgets(widgets: any) {
            this._schema.widgets = {};

            if(!widgets) {
                return;
            }

			for (var widget in widgets) {
                this._schema.widgets[widget] = {};

                var pageBundle = this.bundlePage(widgets[widget]);

                this._schema.widgets[widget] = pageBundle;
			}
        }

        bundlePages(pages: any) {
            this._schema.pages = {};

            if(!pages) {
                return;
            }

			for (var page in pages) {
                this._schema.pages[page] = {};

                var pageBundle = this.bundlePage(pages[page]);

                this._schema.pages[page] = pageBundle;
			}
        }

        bundlePage(_page: any) {
            var page: any = {};

            page.events = _page.events;
            page.parameters = _page.parameters;

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

        encodeBase64(data: string): string {
            return Buffer.from(data).toString('base64');
        }

        readFile(path: string): string {
            try {
                return fs.readFileSync(path);
            }
            catch(ex) {
                console.error("an error occurred during read file '" + path + "': " + ex);

                return "";
            }
        }

        save(filePath: string) {
            var schema = JSON.stringify(this._schema);
            
            var appName = Object.keys(this._schema.pages)[0];

            var script = `var homepage=document.currentScript.getAttribute('homepage');var singlefin_` + appName + ` = new Singlefin(` + schema + `,homepage);`;

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