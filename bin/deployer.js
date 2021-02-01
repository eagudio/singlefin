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
            this._serverInstanceMap = {};
        }
        make(schemasFolderPath) {
            console.log("build bundles...");
            fs.readdirSync(schemasFolderPath).forEach((schemaPath) => {
                var schemaName = path.basename(schemaPath, '.json');
                var appExtension = path.extname(schemaPath);
                if (appExtension == ".json") {
                    var schemaFullPath = path.join(schemasFolderPath, schemaPath);
                    this.makeBundle(schemaName, schemaFullPath);
                }
            });
            console.log("all bundles builded!");
        }
        makeBundle(schemaName, schemaPath) {
            console.log("read schema '" + schemaPath + "'...");
            var schema = require(schemaPath);
            this._serverBundle.bundlefolder = schema.bundlefolder;
            this._serverBundle.port = schema.port;
            this._serverBundle.ssl = schema.ssl;
            this._serverBundle.domains = {};
            this.bundleServerDomains(this._serverBundle.domains, schema.domains);
            var targetFullPath = path.format({
                dir: this._serverBundle.bundlefolder.domains,
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
                this.bundleApps(domainsSchema[key].apps, key);
            }
        }
        bundleServerDomain(domain, domainSchema) {
            domain.path = domainSchema.path;
            domain.options = domainSchema.options;
            domain.router = domainSchema.router;
            domain.models = {};
            domain.patterns = {};
            domain.routes = {};
            this.bundleServerModels(domain.models, domainSchema.models);
            this.bundleServerPatterns(domain.patterns, domainSchema.patterns);
            this.bundleServerRoutes(domain.routes, domainSchema.routes, domainSchema.patterns);
        }
        bundleServerModels(models, modelsSchema) {
            if (!modelsSchema) {
                return;
            }
            for (var key in modelsSchema) {
                models[key] = modelsSchema[key];
                this.addServerInstance(modelsSchema[key]);
            }
        }
        bundleServerPatterns(patterns, patternsSchema) {
            if (!patternsSchema) {
                return;
            }
            for (var key in patternsSchema) {
                patterns[key] = patternsSchema[key];
                this.addServerInstance(patternsSchema[key].handler);
            }
        }
        bundleServerRoutes(routes, routesSchema, patternsSchema) {
            if (!routesSchema) {
                return;
            }
            for (var key in routesSchema) {
                routes[key] = {};
                routes[key].pattern = routesSchema[key].pattern;
                routes[key].method = routesSchema[key].method;
                routes[key].models = routesSchema[key].models;
                routes[key].events = routesSchema[key].events;
                if (routesSchema[key].pattern) {
                    if (patternsSchema[routesSchema[key].pattern].deployer) {
                        var Deployer = require(patternsSchema[routesSchema[key].pattern].deployer);
                        var pattern = new Deployer();
                        pattern.deploy(this, routes[key], routesSchema[key]);
                    }
                }
            }
        }
        addServerInstance(instancePath) {
            this._serverInstanceMap[instancePath] = this.readFile(instancePath, 'utf8');
        }
        bundleApps(apps, domainName) {
            for (var key in apps) {
                var app = apps[key];
                this._bundles[key] = {};
                this.bundleApp(app, this._bundles[key]);
                var targetFullPath = path.format({
                    dir: this._serverBundle.bundlefolder.apps,
                    name: domainName + "_" + key,
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
            var fileContent = this.readFile(filePath);
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
            for (var key in this._serverInstanceMap) {
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
        saveBundle(appName, filePath, bundle) {
            var bundleContent = JSON.stringify(bundle);
            var script = `var homepage=document.currentScript.getAttribute('homepage');var singlefin_` + appName + ` = new Singlefin(` + bundleContent + `,homepage);`;
            fs.writeFileSync(filePath, script);
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