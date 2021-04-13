"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Domain {
    constructor(path, schema) {
        this._routes = [];
        this._services = {};
        this._schema = schema;
        this._path = path;
        this._options = schema.options;
        this._routeActionsHandler = new RouteActionsHandler(this, this._schema.events);
    }
    create(server) {
        return new Promise((resolve, reject) => {
            let express = require('express');
            this._router = express.Router(this.getRouterOptions());
            this._router.use('/sf', express.static(__dirname));
            this.initStatic(this._schema.static);
            this.initServices(this._schema.services).then(() => {
                let models = this.initModels();
                let modelMap = new ModelMap(models);
                return this._routeActionsHandler.inform("initialize", {
                    singlefin: {
                        modelMap: modelMap
                    }
                }, null);
            }).then(() => {
                this.initRoutes(this._schema.routes);
                this._router.use((error, request, response, next) => {
                    response.status(400).send(error);
                });
                server.use(this._path, this._router);
                resolve();
            }).catch((error) => {
                console.error("an error occurred during create domain: " + error);
                reject();
            });
        });
    }
    get router() {
        return this._router;
    }
    get options() {
        return this._options;
    }
    get services() {
        return this._services;
    }
    initStatic(staticSchema) {
        if (!staticSchema) {
            return;
        }
        for (let key in staticSchema) {
            let express = require('express');
            let path = require('path');
            this._router.use(key, express.static(path.join(__dirname, "../../../", staticSchema[key])));
        }
    }
    initRoutes(routesSchema) {
        if (!routesSchema) {
            return;
        }
        for (let key in routesSchema) {
            let route = new Route(this, this._services, this._schema.models, key, routesSchema[key]);
            this._routes.push(route);
        }
    }
    initModels() {
        let models = {};
        for (let key in this._schema.models) {
            let Model = this._schema.models[key];
            models[key] = new Model();
        }
        return models;
    }
    initServices(servicesSchema) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this._services["empty"] = new EmptyDataService(this);
            this._services["data"] = new DataService(this);
            this._services["file"] = new FileService(this);
            this._services["multipart"] = new MultipartService(this);
            for (let key in servicesSchema) {
                let Service = servicesSchema[key].handler;
                this._services[key] = new Service(this);
            }
            for (let key in this._services) {
                yield this._services[key].run(servicesSchema[key]).then(() => {
                }).catch((error) => {
                    console.error("an error occurred during run service '" + key + "':" + error);
                    return reject();
                });
            }
            resolve();
        }));
    }
    getRouterOptions() {
        if (this._schema && this._schema.router) {
            return this._schema.router;
        }
        return;
    }
}
class Route {
    constructor(domain, services, modelClasses, route, config) {
        this._domain = domain;
        this._route = route;
        this._modelClasses = modelClasses;
        this._config = config;
        this._method = config.method;
        this._service = new EmptyDataService(domain);
        this.makeService(services, config.service);
        this._routeActionsHandler = new RouteActionsHandler(domain, this._config.events);
        this._currentRouteActionsHandler = this._routeActionsHandler;
        this.initRouting();
    }
    get domain() {
        return this._domain;
    }
    get currentRouteActionsHandler() {
        return this._currentRouteActionsHandler;
    }
    set currentRouteActionsHandler(currentRouteActionsHandler) {
        this._currentRouteActionsHandler = currentRouteActionsHandler;
    }
    inform(event, request, response) {
        return this._currentRouteActionsHandler.inform(event, request, response);
    }
    initRouting() {
        if (!this._method) {
            this._method = "get";
        }
        this._domain.router[this._method](this._route, [(request, response, next) => {
                let models = this.initModels();
                let modelMap = new ModelMap(models);
                request.singlefin = {
                    modelMap: modelMap
                };
                next();
            }, (request, response, next) => {
                this._routeActionsHandler.inform("request", request, response).then(() => {
                    next();
                }).catch((error) => {
                    next(error);
                });
            }, this._service.route(this, this._config), (request, response, next) => {
                this._routeActionsHandler.inform("response", request, response).then(() => {
                    next();
                }).catch((error) => {
                    next(error);
                });
            }, (request, response, next) => {
                let modelMap = request.singlefin.modelMap;
                this._service.reply(request, response, modelMap, this._config).then(() => {
                }).catch((error) => {
                    next(error);
                });
            }]);
    }
    initModels() {
        let models = {};
        for (let key in this._modelClasses) {
            let Model = this._modelClasses[key];
            models[key] = new Model();
        }
        return models;
    }
    makeService(services, serviceName) {
        if (!serviceName) {
            return;
        }
        this._service = services[serviceName];
    }
}
class Runtime {
    static getParentInstance(data, exp) {
        let vars = exp.split(/[.\[\]]/);
        let _data = data;
        vars = vars.filter((value) => {
            return value != "";
        });
        if (vars.length == 1) {
            return _data[vars[0]];
        }
        for (let i = 0; i < vars.length - 1; i++) {
            _data = _data[vars[i]];
        }
        return _data;
    }
    static getProperty(data, exp) {
        let vars = exp.split(".");
        let value = data;
        for (let i = 0; i < vars.length; i++) {
            value = this.getItem(value, vars[i]);
        }
        return value;
    }
    static setProperty(exp, data, value) {
        let vars = exp.split(".");
        let _data = data;
        for (let i = 0; i < vars.length - 1; i++) {
            _data = this.getItem(_data, vars[i]);
        }
        this.setItem(vars[vars.length - 1], _data, value);
    }
    static getParentPath(exp) {
        let vars = exp.split(/[.\[]/);
        let _path = "";
        let count = 0;
        if (vars.length == 1) {
            return vars[0];
        }
        vars.map((value) => {
            let newValue = value;
            let isArrayItem = false;
            if (value.charAt(value.length - 1) === "]") {
                newValue = "[" + value;
                isArrayItem = true;
            }
            if (count < vars.length - 1) {
                if (count > 0 && !isArrayItem) {
                    _path += "." + newValue;
                }
                else {
                    _path += newValue;
                }
            }
            count++;
            return newValue;
        });
        return _path;
    }
    static getPropertyName(exp) {
        let vars = exp.split(".");
        return this.getItemName(vars[vars.length - 1]);
    }
    static getItemName(exp) {
        let res = exp.split("[");
        if (res.length === 1) {
            return res[0];
        }
        let index = res[1].substring(0, res[1].length - 1);
        return index;
    }
    static getItem(data, exp) {
        let res = exp.split("[");
        if (res.length === 1) {
            return data[res[0]];
        }
        let array = res[0];
        let index = res[1].substring(0, res[1].length - 1);
        return data[array][index];
    }
    static setItem(exp, data, instance) {
        let res = exp.split("[");
        if (res.length === 1) {
            data[res[0]] = instance;
            return;
        }
        let array = res[0];
        let index = res[1].substring(0, res[1].length - 1);
        data[array][index] = instance;
    }
}
class Server {
    constructor(schema, server) {
        this._domains = {};
        this._schema = schema;
        this._server = server;
        let express = require('express');
        let body_parser = require('body-parser');
        if (!this._server) {
            this._server = express().use(body_parser.json());
        }
        this._port = this.getPortOptions();
        this._sslOptions = this.getSSLOptions();
        this.makeDomains(schema.domains);
    }
    startServer() {
        let fs = require('fs');
        let https = require('https');
        this.startDomains().then(() => {
            if (!this._sslOptions) {
                this._server.listen(this._port, () => {
                    console.log("singlefin: http web server listening on port " + this._port);
                });
            }
            else {
                const privateKey = fs.readFileSync(this._sslOptions.privatekey, 'utf8');
                const certificate = fs.readFileSync(this._sslOptions.certificate, 'utf8');
                const ca = fs.readFileSync(this._sslOptions.ca, 'utf8');
                const credentials = {
                    key: privateKey,
                    cert: certificate,
                    ca: ca
                };
                this._httpsServer = https.createServer(credentials, this._server);
                this._httpsServer.listen(this._port, () => {
                    console.log("singlefin: https web server listening on port " + this._port);
                });
            }
        }).catch((error) => {
            console.error("singlefin: an error occurred during start http server: " + error);
        });
    }
    makeDomains(domainsSchema) {
        if (!domainsSchema) {
            return;
        }
        for (let path in domainsSchema) {
            let domainSchema = require(domainsSchema[path]);
            this._domains[path] = new Domain(path, domainSchema.getBundle());
        }
    }
    startDomains() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            for (let name in this._domains) {
                yield this._domains[name].create(this._server).then(() => {
                }).catch(() => {
                    return reject();
                });
            }
            resolve();
        }));
    }
    getPortOptions() {
        if (this._schema.port) {
            return this._schema.port;
        }
        return 3000;
    }
    getSSLOptions() {
        if (this._schema.ssl) {
            return this._schema.ssl;
        }
        return;
    }
}
class Singlefin {
    run(serverConfigPath, app) {
        try {
            let serverConfig = require(serverConfigPath);
            let server = new Server(serverConfig, app);
            if (!app) {
                server.startServer();
            }
        }
        catch (ex) {
            console.error("singlefin: bundle error: " + ex);
        }
    }
}
module.exports.singlefin = new Singlefin();
class RouteAction {
    constructor(domain, parameters) {
        this._parameters = parameters;
        this._routeActionsHandler = new RouteActionsHandler(domain, parameters.events);
    }
    get parameters() {
        return this._parameters;
    }
    do(domain, request, response) {
        return this.handle(domain, this._routeActionsHandler, request, response);
    }
}
/// <reference path="routeaction.ts"/>
class ModelAction extends RouteAction {
    handle(domain, routeActionsHandler, request, response) {
        return new Promise((resolve, reject) => {
            let modelMap = request.singlefin.modelMap;
            let instance = modelMap.getParentInstance(this.parameters);
            let method = modelMap.getValue(this.parameters);
            method.call(instance, domain, request, response).then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    }
}
/// <reference path="routeaction.ts"/>
class NullAction extends RouteAction {
    handle(domain, routeActionsHandler, request, response) {
        console.error("action not recognized: " + this.parameters);
        return Promise.reject("action not recognized: " + this.parameters);
    }
}
class RouteActionsHandler {
    constructor(domain, events) {
        this._routeActions = {};
        this._domain = domain;
        this.makeActions(events);
    }
    inform(event, request, reponse) {
        return new Promise((resolve, reject) => {
            let routeActions = this._routeActions[event];
            this.performRouteActions(0, routeActions, request, reponse).then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    }
    performRouteActions(index, routeActions, request, reponse) {
        return new Promise((resolve, reject) => {
            if (!routeActions) {
                return resolve();
            }
            if (index >= routeActions.length) {
                return resolve();
            }
            routeActions[index].do(this._domain, request, reponse).then(() => {
                index++;
                return this.performRouteActions(index, routeActions, request, reponse);
            }).then(() => {
                return resolve();
            }).catch((error) => {
                return reject(error);
            });
        });
    }
    makeActions(events) {
        for (let event in events) {
            this._routeActions[event] = [];
            this._routeActions[event] = this.makeRouteActions(events[event]);
        }
    }
    makeRouteActions(routeActions) {
        let actions = [];
        for (let i = 0; i < routeActions.length; i++) {
            actions.push(this.makeRouteAction(routeActions[i]));
        }
        return actions;
    }
    makeRouteAction(routeAction) {
        let actionType = Object.keys(routeAction)[0];
        if (actionType == "model") {
            return new ModelAction(this._domain, routeAction[actionType]);
        }
        else if (actionType == "service") {
            return new ServiceAction(this._domain, routeAction[actionType]);
        }
        return new NullAction(this._domain, actionType);
    }
}
/// <reference path="routeaction.ts"/>
class ServiceAction extends RouteAction {
    handle(domain, routeActionsHandler, request, response) {
        return new Promise((resolve, reject) => {
            let services = domain.services;
            let service = services[this.parameters.service];
            service.call(routeActionsHandler, request.singlefin.modelMap, this.parameters, request, response).then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    }
}
class Service {
    constructor(domain) {
        this._domain = domain;
    }
    get domain() {
        return this._domain;
    }
    route(route, parameters) {
        return (request, response, next) => {
            this.call(route.currentRouteActionsHandler, request.singlefin.modelMap, parameters, request, response).then(() => {
                next();
            }).catch((error) => {
                next(error);
            });
        };
    }
}
module.exports.service = Service;
/// <reference path="service.ts"/>
class DataService extends Service {
    run(parameters) {
        return Promise.resolve();
    }
    call(routeActionsHandler, modelMap, parameters, request, response) {
        return Promise.resolve();
    }
    reply(request, response, modelMap, parameters) {
        let data = modelMap.getValue("data");
        response.send(data);
        return Promise.resolve();
    }
}
/// <reference path="service.ts"/>
class EmptyDataService extends Service {
    run(parameters) {
        return Promise.resolve();
    }
    call(routeActionsHandler, modelMap, parameters, request, response) {
        return Promise.resolve();
    }
    reply(request, response, modelMap, parameters) {
        response.end();
        return Promise.resolve();
    }
}
/// <reference path="service.ts"/>
class FileService extends Service {
    run(parameters) {
        return Promise.resolve();
    }
    call(routeActionsHandler, modelMap, parameters, request, response) {
        return Promise.resolve();
    }
    reply(request, response, modelMap, parameters) {
        let path = require('path');
        let fileName = modelMap.getValue(parameters.path);
        let filePath = path.join(__dirname, "../../../", parameters.from, fileName);
        response.sendFile(filePath);
        return Promise.resolve();
    }
}
class ModelMap {
    constructor(models) {
        this._models = models;
    }
    getParentInstance(valuePath) {
        return Runtime.getParentInstance(this._models, valuePath);
    }
    getValue(valuePath) {
        return Runtime.getProperty(this._models, valuePath);
    }
    setValue(valuePath, value) {
        Runtime.setProperty(valuePath, this._models, value);
    }
}
/// <reference path="service.ts"/>
class MultipartService extends Service {
    constructor() {
        super(...arguments);
        this.multer = require('multer');
    }
    run(config) {
        return Promise.resolve();
    }
    call(routeActionsHandler, modelMap, parameters, request, response) {
        return Promise.resolve();
    }
    route(route, parameters) {
        let storage = this.multer.diskStorage({
            destination: (req, file, cb) => {
                let path = require('path');
                let storagePath = path.join(__dirname, "../../../", parameters.storage);
                cb(null, storagePath);
            },
            filename: (request, file, cb) => {
                route.inform("readfile", request, file).then(() => {
                    let modelMap = request.singlefin.modelMap;
                    let fileName = modelMap.getValue(parameters.file.name);
                    let fileExtension = modelMap.getValue(parameters.file.extension);
                    cb(null, fileName + "." + fileExtension);
                }).catch((error) => {
                    cb(error);
                });
            }
        });
        let upload = this.multer({ storage: storage });
        return upload.single(parameters.fieldname);
    }
    reply(request, response, modelMap, parameters) {
        return new Promise((resolve, reject) => {
            let file = request.file;
            if (!file) {
                return reject("uploadFileError");
            }
            response.end();
        });
    }
}
//# sourceMappingURL=singlefinserver.js.map