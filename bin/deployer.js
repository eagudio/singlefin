"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SinglefinDeployment = void 0;
const fs = require('fs');
const path = require('path');
var SinglefinDeployment;
(function (SinglefinDeployment) {
    class Deployer {
        constructor() {
            this._serverInstanceMap = {};
        }
        make(schemasPath) {
            console.log("build bundles...");
            let schema = require(schemasPath);
            this.bundleModules(schema.modules);
            this.bundleDomains(schema.domains);
            this.bundleApps(schema.apps, schema.modules);
            console.log("all bundles builded!");
        }
        bundleModules(modulesSchema) {
            if (!modulesSchema) {
                return;
            }
            for (let key in modulesSchema) {
                if (typeof modulesSchema[key] != "string") {
                    this.bundleModules(modulesSchema[key]);
                }
                else {
                    let moduleBundle = this.bundleFile(modulesSchema[key]);
                    modulesSchema[key] = moduleBundle;
                }
            }
        }
        bundleDomains(domainsSchema) {
            if (!domainsSchema) {
                return;
            }
            for (let key in domainsSchema) {
                let domain = {};
                this.bundleServerDomain(domain, domainsSchema[key]);
                console.log(domainsSchema[key].bundle);
                this.saveServerBundle(domainsSchema[key].bundle, domain);
            }
        }
        bundleServerDomain(domain, domainSchema) {
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
        bundleServerModels(models, modelsSchema) {
            if (!modelsSchema) {
                return;
            }
            for (let key in modelsSchema) {
                models[key] = modelsSchema[key];
                this.addServerInstance(modelsSchema[key]);
            }
        }
        bundleServerServices(services, servicesSchema) {
            if (!servicesSchema) {
                return;
            }
            for (let key in servicesSchema) {
                services[key] = servicesSchema[key];
                this.addServerInstance(servicesSchema[key].handler);
            }
        }
        bundleServerRoutes(routes, routesSchema, servicesSchema) {
            if (!routesSchema) {
                return;
            }
            for (let key in routesSchema) {
                routes[key] = routesSchema[key];
                if (routesSchema[key].service) {
                    if (servicesSchema[routesSchema[key].service]) {
                        if (servicesSchema[routesSchema[key].service].deployer) {
                            let Deployer = require(servicesSchema[routesSchema[key].service].deployer);
                            let service = new Deployer();
                            service.deploy(this, routes[key], routesSchema[key]);
                        }
                    }
                }
                routes[key].events = routesSchema[key].events;
                this.bundleServerRouteEvents(routes[key].events, routesSchema[key].events, servicesSchema);
            }
        }
        bundleServerRouteEvents(routeEvents, routesEventsSchema, servicesSchema) {
            for (let key in routesEventsSchema) {
                routeEvents[key] = routesEventsSchema[key];
                for (let i = 0; i < routesEventsSchema[key].length; i++) {
                    if (routesEventsSchema[key][i].service) {
                        routeEvents[key].service = routesEventsSchema[key][i].service;
                        if (servicesSchema[routesEventsSchema[key][i].service.service]) {
                            if (servicesSchema[routesEventsSchema[key][i].service.service].deployer) {
                                let Deployer = require(servicesSchema[routesEventsSchema[key][i].service.service].deployer);
                                let service = new Deployer();
                                service.deploy(this, routeEvents[key].service, routesEventsSchema[key][i].service);
                            }
                        }
                        routeEvents[key].service.events = routesEventsSchema[key][i].service.events;
                        this.bundleServerRouteEvents(routeEvents[key].service.events, routesEventsSchema[key][i].service.events, servicesSchema);
                    }
                }
            }
        }
        addServerInstance(instancePath) {
            this._serverInstanceMap[instancePath] = this.readFile(instancePath, 'utf8');
        }
        bundleApps(appsSchema, modules) {
            for (let key in appsSchema) {
                let app = {};
                app.modules = modules;
                this.bundleApp(appsSchema[key], app);
                console.log(appsSchema[key].bundle);
                this.saveBundle(key, appsSchema[key].bundle, app);
            }
        }
        bundleApp(app, bundle) {
            bundle.homepage = app.homepage;
            this.bundleResources(app.resources, bundle);
            this.bundleModels(app.models, bundle);
            this.bundleProxies(app.proxies, bundle);
            this.bundleWidgets(app.widgets, bundle);
            this.bundlePages(app.pages, bundle);
        }
        bundleResources(resources, bundle) {
            bundle.resources = {};
            if (!resources) {
                return;
            }
            for (let languageKey in resources) {
                bundle.resources[languageKey] = {};
                for (let resourceKey in resources[languageKey]) {
                    let fileBundle = this.bundleFile(resources[languageKey][resourceKey]);
                    bundle.resources[languageKey][resourceKey] = fileBundle;
                }
            }
        }
        bundleModels(models, bundle) {
            bundle.models = {};
            if (!models) {
                return;
            }
            for (let model in models) {
                bundle.models[model] = {};
                let fileBundle = this.bundleFile(models[model]);
                bundle.models[model] = fileBundle;
            }
        }
        bundleProxies(proxies, bundle) {
            bundle.proxies = [];
            if (!proxies) {
                return;
            }
            for (let i = 0; i < proxies.length; i++) {
                let proxy = {};
                proxy.events = proxies[i].events;
                let fileBundle = this.bundleFile(proxies[i].proxy);
                proxy.proxy = fileBundle;
                bundle.proxies.push(proxy);
            }
        }
        bundleWidgets(widgets, bundle) {
            bundle.widgets = {};
            if (!widgets) {
                return;
            }
            for (let widget in widgets) {
                bundle.widgets[widget] = {};
                let pageBundle = this.bundlePage(widgets[widget]);
                bundle.widgets[widget] = pageBundle;
            }
        }
        bundlePages(pages, bundle) {
            bundle.pages = {};
            if (!pages) {
                return;
            }
            for (let page in pages) {
                bundle.pages[page] = {};
                let pageBundle = this.bundlePage(pages[page]);
                bundle.pages[page] = pageBundle;
            }
        }
        bundlePage(_page) {
            let page = {};
            page.events = _page.events;
            page.parameters = _page.parameters;
            page.hidden = _page.hidden;
            page.showed = _page.showed;
            page.models = _page.models;
            page.unwind = _page.unwind;
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
            if (_page.commit) {
                page.commit = this.bundlePageMethod(_page.commit);
            }
            if (_page.group) {
                page.group = this.bundlePageMethod(_page.group);
            }
            return page;
        }
        bundleView(view) {
            return this.bundleFile(view);
        }
        bundleControllers(_controllers) {
            let controllers = [];
            for (let i = 0; i < _controllers.length; i++) {
                let controller = this.bundleFile(_controllers[i]);
                controllers.push(controller);
            }
            return controllers;
        }
        bundleStyles(_styles) {
            let styles = [];
            for (let i = 0; i < _styles.length; i++) {
                let style = this.bundleFile(_styles[i]);
                styles.push(style);
            }
            return styles;
        }
        bundleScripts(_scripts) {
            let scripts = [];
            for (let i = 0; i < _scripts.length; i++) {
                let script = this.bundleFile(_scripts[i]);
                scripts.push(script);
            }
            return scripts;
        }
        bundlePageMethod(_method) {
            let method = [];
            for (let i = 0; i < _method.length; i++) {
                let pages = _method[i];
                for (let _page in pages) {
                    let bundlePage = this.bundlePage(pages[_page]);
                    let page = {};
                    page[_page] = bundlePage;
                    method.push(page);
                }
            }
            return method;
        }
        bundleFile(filePath) {
            let fileContent = this.readFile(filePath);
            let base64FileContent = this.encodeBase64(fileContent);
            return base64FileContent;
        }
        bundleServiceRequest(request) {
            let service = request["service"];
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
            let bundleContent = JSON.stringify(bundle);
            for (let key in this._serverInstanceMap) {
                let regex = new RegExp('"' + key + '"', "g");
                bundleContent = bundleContent.replace(regex, this._serverInstanceMap[key]);
            }
            let script = `
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
            let bundleContent = JSON.stringify(bundle);
            let script = `let homepage=document.currentScript.getAttribute('homepage');let singlefin_` + appName + ` = new Singlefin(` + bundleContent + `,homepage);`;
            fs.writeFileSync(filePath, script);
        }
        resolvePath(path) {
            let pathRegExp = new RegExp("@([a-z0-9_-]+)");
            let pathMarkup = pathRegExp.exec(path);
            return pathMarkup;
        }
    }
    SinglefinDeployment.Deployer = Deployer;
})(SinglefinDeployment = exports.SinglefinDeployment || (exports.SinglefinDeployment = {}));
//# sourceMappingURL=deployer.js.map