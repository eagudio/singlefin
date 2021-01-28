"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SinglefinDeployment = void 0;
const fs = require('fs');
const path = require('path');
var SinglefinDeployment;
(function (SinglefinDeployment) {
    class Deployer {
        constructor() {
            this._serverBundle = {};
            this._bundles = {};
            this._paths = {};
            this._handlerMap = {};
            this._serverModelMap = {};
        }
        make(schemasFolderPath, targetsFolderPath, targetsServerFolderPath) {
            console.log("build bundles...");
            fs.readdirSync(schemasFolderPath).forEach((schemaPath) => {
                var schemaName = path.basename(schemaPath, '.json');
                var appExtension = path.extname(schemaPath);
                if (appExtension == ".json") {
                    var schemaFullPath = path.join(schemasFolderPath, schemaPath);
                    this.makeBundle(schemaName, schemaFullPath, targetsFolderPath, targetsServerFolderPath);
                }
            });
            console.log("all bundles builded!");
        }
        makeBundle(schemaName, schemaPath, targetPath, serverTargetPath) {
            console.log("read schema '" + schemaPath + "'...");
            var schema = require(schemaPath);
            this._paths = schema.paths;
            if (serverTargetPath) {
                this.makeServerBundle(schema, schemaName, serverTargetPath);
            }
            //this.bundleApps(schema.apps, schemaName, targetPath);
        }
        makeServerBundle(serverSchema, schemaName, targetPath) {
            if (!serverSchema) {
                return;
            }
            this._serverBundle.port = serverSchema.port;
            this._serverBundle.ssl = serverSchema.ssl;
            this._serverBundle.domains = {};
            this.bundleServerDomains(this._serverBundle.domains, serverSchema.domains);
            //this.bundleServerRoutes(serverSchema.routes);
            var targetFullPath = path.format({
                dir: targetPath,
                name: schemaName + "_server",
                ext: '.js'
            });
            console.log(targetFullPath);
            this.saveServerBundle(targetFullPath, this._serverBundle);
        }
        bundleServerDomains(domains, domainsSchema) {
            if (!domainsSchema) {
                return;
            }
            for (var key in domainsSchema) {
                domains[key] = {};
                this.bundleServerDomain(domains[key], domainsSchema[key]);
            }
        }
        bundleServerDomain(domain, domainSchema) {
            domain.path = domainSchema.path;
            domain.options = domainSchema.options;
            domain.router = domainSchema.router;
            domain.models = {};
            this.bundleServerModels(domain.models, domainSchema.models);
        }
        bundleServerModels(models, modelsSchema) {
            if (!modelsSchema) {
                return;
            }
            for (var key in modelsSchema) {
                models[key] = modelsSchema[key];
                this.addServerModel(modelsSchema[key]);
            }
        }
        addServerModel(modelPath) {
            this._serverModelMap[modelPath] = this.readFile(modelPath, 'utf8');
        }
        bundleServerPublic(publicSchema) {
            if (!publicSchema) {
                return;
            }
            if (publicSchema.path) {
                publicSchema.path = this.normalizePath(publicSchema.path, this._paths);
            }
        }
        bundleServerRoutes(routeSchemas) {
            if (!routeSchemas) {
                return;
            }
            for (var i = 0; i < routeSchemas.length; i++) {
                this.bundleServerRoute(routeSchemas[i]);
            }
            this._serverBundle.routes = routeSchemas;
        }
        bundleServerRoute(routeSchema) {
            this.bundleServerRouteHandler(routeSchema.handler);
            this.bundleServerFilePatternRoute(routeSchema);
            this.bundleServerQueryPatternRoute(routeSchema);
            this.bundleServerRouteThen(routeSchema.then);
            this.bundleServerRouteCatch(routeSchema.catch);
        }
        bundleServerRouteHandler(routeHandler) {
            if (!routeHandler) {
                return;
            }
            var fullRouteHandlerPath = this.normalizePath(routeHandler, this._paths);
            this._handlerMap[routeHandler] = this.readFile(fullRouteHandlerPath, 'utf8');
        }
        bundleServerFilePatternRoute(routeSchema) {
            if (!routeSchema) {
                return;
            }
            if (routeSchema.pattern != "file") {
                return;
            }
            if (!routeSchema.options) {
                return;
            }
            if (!routeSchema.options.file) {
                return;
            }
            var filePath = this.normalizePath(routeSchema.options.file.path, this._paths);
            routeSchema.options.file.path = filePath;
        }
        bundleServerQueryPatternRoute(routeSchema) {
            if (!routeSchema) {
                return;
            }
            if (routeSchema.pattern != "query") {
                return;
            }
            if (!routeSchema.options) {
                return;
            }
            if (!routeSchema.options.query) {
                return;
            }
            var queryPath = this.normalizePath(routeSchema.options.query, this._paths);
            routeSchema.options.query = queryPath;
        }
        bundleServerRouteThen(thenSchema) {
            if (!thenSchema) {
                return;
            }
            for (var key in thenSchema) {
                this.bundleServerRoute(thenSchema[key]);
            }
        }
        bundleServerRouteCatch(catchSchema) {
            if (!catchSchema) {
                return;
            }
            this.bundleServerRoute(catchSchema);
        }
        bundleApps(apps, schemaName, targetPath) {
            for (var key in apps) {
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
        bundleApp(app, bundle) {
            bundle.homepage = app.homepage;
            this.bundleResources(app.resources, bundle);
            this.bundleModels(app.models, bundle);
            this.bundleWidgets(app.widgets, bundle);
            this.bundlePages(app.pages, bundle);
        }
        bundleResources(resources, bundle) {
            bundle.resources = {};
            if (!resources) {
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
        bundleModels(models, bundle) {
            bundle.models = {};
            if (!models) {
                return;
            }
            for (var model in models) {
                bundle.models[model] = {};
                var fileBundle = this.bundleFile(models[model]);
                bundle.models[model] = fileBundle;
            }
        }
        bundleWidgets(widgets, bundle) {
            bundle.widgets = {};
            if (!widgets) {
                return;
            }
            for (var widget in widgets) {
                bundle.widgets[widget] = {};
                var pageBundle = this.bundlePage(widgets[widget]);
                bundle.widgets[widget] = pageBundle;
            }
        }
        bundlePages(pages, bundle) {
            bundle.pages = {};
            if (!pages) {
                return;
            }
            for (var page in pages) {
                bundle.pages[page] = {};
                var pageBundle = this.bundlePage(pages[page]);
                bundle.pages[page] = pageBundle;
            }
        }
        bundlePage(_page) {
            var page = {};
            page.events = _page.events;
            page.parameters = _page.parameters;
            page.models = _page.models;
            page.list = _page.list;
            if (_page.view) {
                page.view = this.bundleView(_page.view);
            }
            if (_page.controllers) {
                page.controllers = this.bundleControllers(_page.controllers);
            }
            if (_page.styles) {
                page.styles = this.bundleStyles(_page.styles);
            }
            if (_page.scripts) {
                page.scripts = this.bundleScripts(_page.scripts);
            }
            if (_page.append) {
                page.append = this.bundlePageMethod(_page.append);
            }
            if (_page.replace) {
                page.replace = this.bundlePageMethod(_page.replace);
            }
            if (_page.group) {
                page.group = this.bundlePageMethod(_page.group);
            }
            if (_page.unwind) {
                page.unwind = this.bundlePageMethod(_page.unwind);
            }
            return page;
        }
        bundleView(view) {
            return this.bundleFile(view);
        }
        bundleControllers(_controllers) {
            var controllers = [];
            for (var i = 0; i < _controllers.length; i++) {
                var controller = this.bundleFile(_controllers[i]);
                controllers.push(controller);
            }
            return controllers;
        }
        bundleStyles(_styles) {
            var styles = [];
            for (var i = 0; i < _styles.length; i++) {
                var style = this.bundleFile(_styles[i]);
                styles.push(style);
            }
            return styles;
        }
        bundleScripts(_scripts) {
            var scripts = [];
            for (var i = 0; i < _scripts.length; i++) {
                var script = this.bundleFile(_scripts[i]);
                scripts.push(script);
            }
            return scripts;
        }
        bundlePageMethod(_method) {
            var method = [];
            for (var i = 0; i < _method.length; i++) {
                var pages = _method[i];
                for (var _page in pages) {
                    var bundlePage = this.bundlePage(pages[_page]);
                    var page = {};
                    page[_page] = bundlePage;
                    method.push(page);
                }
            }
            return method;
        }
        bundleFile(filePath) {
            var filepath = this.normalizePath(filePath, this._paths);
            var fileContent = this.readFile(filepath);
            var base64FileContent = this.encodeBase64(fileContent);
            return base64FileContent;
        }
        bundleServiceRequest(request) {
            var service = request["service"];
            if (!service) {
                return request;
            }
            service = {
                type: "POST",
                url: "",
            };
        }
        encodeBase64(data) {
            return Buffer.from(data).toString('base64');
        }
        readFile(path, encoding) {
            try {
                return fs.readFileSync(path, encoding);
            }
            catch (ex) {
                console.error("an error occurred during read file '" + path + "': " + ex);
                return "";
            }
        }
        saveServerBundle(filePath, bundle) {
            var bundleContent = JSON.stringify(bundle);
            for (var key in this._serverModelMap) {
                var regex = new RegExp('"' + key + '"', "g");
                bundleContent = bundleContent.replace(regex, this._serverModelMap[key]);
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
        saveBundle(appName, filePath, bundle) {
            var bundleContent = JSON.stringify(bundle);
            var script = `var homepage=document.currentScript.getAttribute('homepage');var singlefin_` + appName + ` = new Singlefin(` + bundleContent + `,homepage);`;
            fs.writeFileSync(filePath, script);
        }
        normalizePath(path, pathsMap) {
            if (!pathsMap) {
                return path;
            }
            var pathMarkup = this.resolvePath(path);
            if (pathMarkup) {
                var itemPath = pathsMap[pathMarkup[1]];
                return path.replace(pathMarkup[0], itemPath);
            }
            return path;
        }
        normalizePaths(paths, pathsMap) {
            var normalizedPaths = [];
            if (!pathsMap) {
                return paths;
            }
            for (var i = 0; i < paths.length; i++) {
                normalizedPaths.push(this.normalizePath(paths[i], pathsMap));
            }
            return normalizedPaths;
        }
        resolvePath(path) {
            var pathRegExp = new RegExp("@([a-z0-9_-]+)");
            var pathMarkup = pathRegExp.exec(path);
            return pathMarkup;
        }
    }
    SinglefinDeployment.Deployer = Deployer;
})(SinglefinDeployment = exports.SinglefinDeployment || (exports.SinglefinDeployment = {}));
//# sourceMappingURL=deployer.js.map