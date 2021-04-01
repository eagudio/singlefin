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
            var express = require('express');
            this._router = express.Router(this.getRouterOptions());
            this._router.use('/sf', express.static(__dirname));
            this.initStatic(this._schema.static);
            this.initServices(this._schema.services).then(() => {
                var models = this.initModels();
                var modelMap = new ModelMap(models);
                return this._routeActionsHandler.inform("initialize", {
                    singlefin: {
                        modelMap: modelMap
                    }
                });
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
        for (var key in staticSchema) {
            var express = require('express');
            var path = require('path');
            this._router.use(key, express.static(path.join(__dirname, "../../../", staticSchema[key])));
        }
    }
    initRoutes(routesSchema) {
        if (!routesSchema) {
            return;
        }
        for (var key in routesSchema) {
            var route = new Route(this, this._services, this._schema.models, key, routesSchema[key]);
            this._routes.push(route);
        }
    }
    initModels() {
        var models = {};
        for (var key in this._schema.models) {
            var Model = this._schema.models[key];
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
            for (var key in servicesSchema) {
                var Service = servicesSchema[key].handler;
                this._services[key] = new Service(this);
            }
            for (var key in this._services) {
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
    inform(event, request) {
        return this._currentRouteActionsHandler.inform(event, request);
    }
    initRouting() {
        if (!this._method) {
            this._method = "get";
        }
        this._domain.router[this._method](this._route, [(request, response, next) => {
                var models = this.initModels();
                var modelMap = new ModelMap(models);
                request.singlefin = {
                    modelMap: modelMap
                };
                next();
            }, (request, response, next) => {
                this._routeActionsHandler.inform("request", request).then(() => {
                    next();
                }).catch((error) => {
                    next(error);
                });
            }, this._service.route(this, this._config), (request, response, next) => {
                this._routeActionsHandler.inform("response", request).then(() => {
                    next();
                }).catch((error) => {
                    next(error);
                });
            }, (request, response, next) => {
                var modelMap = request.singlefin.modelMap;
                this._service.reply(request, response, modelMap, this._config).then(() => {
                }).catch((error) => {
                    next(error);
                });
            }]);
    }
    initModels() {
        var models = {};
        for (var key in this._modelClasses) {
            var Model = this._modelClasses[key];
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
class RouteDataResponse {
    constructor(response, result) {
        this._response = response;
        this._result = result;
    }
    send() {
        this._response.send(this._result);
    }
}
class RouteFile {
    constructor(router, options) {
    }
    call(request, response, options, data) {
        return new Promise((resolve, reject) => {
            resolve(options);
        });
    }
}
class RouteFileResponse {
    constructor(response, result) {
        this._response = response;
        this._result = result;
    }
    send() {
        this._response.sendFile(this._result.file.name, { root: this._result.file.path });
    }
}
class RouteHandler {
    constructor(router, config) {
        this._router = router;
        this._path = config.path;
        this._method = this.getHttpMethod(config);
        this._routePromise = new RoutePromise(router, config);
        this.use();
    }
    use() {
        if (this._routePromise.hasCallMethod()) {
            if (!this._path) {
                this._router[this._method]((request, response) => {
                    this._routePromise.call(request, response).then((result) => {
                        this.sendResponse(response, result);
                    }).catch((result) => {
                        this.sendError(response, result);
                    });
                });
            }
            else {
                this._router[this._method](this._path, (request, response) => {
                    this._routePromise.call(request, response).then((result) => {
                        this.sendResponse(response, result);
                    }).catch((result) => {
                        this.sendError(response, result);
                    });
                });
            }
        }
    }
    getHttpMethod(config) {
        if (!config.method) {
            if (!config.pattern) {
                return "use";
            }
            if (config.pattern == "file") {
                return "get";
            }
            if (config.pattern == "query") {
                return "post";
            }
        }
        return config.method;
    }
    sendResponse(response, result) {
        var routeResponse = this.getResponse(response, result);
        routeResponse.send();
    }
    sendError(response, result) {
        response.status(400);
        var routeResponse = this.getResponse(response, result);
        routeResponse.send();
    }
    getResponse(response, result) {
        /*if(!result) {
            return new RouteEndResponse();
        }*/
        if (result.file) {
            return new RouteFileResponse(response, result);
        }
        return new RouteDataResponse(response, result);
    }
}
class RoutePromise {
    constructor(router, config) {
        this._thenRouteMap = {};
        this._router = router;
        this._handler = config.handler;
        this._pattern = config.pattern;
        this._options = config.options;
        this._then = config.then;
        this._catch = config.catch;
        this.makeRoute();
        this.makeThenRouteMap();
        this.makeCatchRouteMap();
    }
    hasCallMethod() {
        return !this._route.call ? false : true;
    }
    call(request, response, data) {
        return this._route.call(request, response, this._options, data).then((result) => {
            var route = null;
            var send = null;
            var data = result;
            if (result) {
                var objKey = Object.keys(result)[0];
                if (objKey == "route") {
                    var routeObj = result[objKey];
                    route = Object.keys(routeObj)[0];
                    data = routeObj[route];
                }
                else if (objKey == "send") {
                    var sendObj = result[objKey];
                    send = Object.keys(sendObj)[0];
                    data = sendObj[send];
                }
            }
            if (route && this._thenRouteMap[route]) {
                return this._thenRouteMap[route].call(request, response, data);
            }
            return Promise.resolve(result);
        }).catch((result) => {
            if (this._catchRoute) {
                return this._catchRoute.call(request, response, result);
            }
            return Promise.reject(result);
        });
    }
    makeRoute() {
        try {
            if (this._pattern) {
                this._route = this.makeRouteFromPattern(this._pattern);
                return;
            }
            if (this._handler) {
                var Route = this._handler;
                this._route = new Route(this._router, this._options);
                return;
            }
        }
        catch (ex) {
            console.error("singlefin: an error occurred during instance route " + this._handler + " :" + ex);
        }
    }
    makeRouteFromPattern(pattern) {
        if (pattern == "file") {
            return new RouteFile(this._router, this._options);
        }
        else if (pattern == "query") {
            return new RouteQuery(this._router, this._options);
        }
        return null;
    }
    makeThenRouteMap() {
        if (!this._then) {
            return;
        }
        for (var route in this._then) {
            this._thenRouteMap[route] = new RoutePromise(this._router, this._then[route]);
        }
    }
    makeCatchRouteMap() {
        if (!this._catch) {
            return;
        }
        this._catchRoute = new RoutePromise(this._router, this._catch);
    }
}
class RouteQuery {
    constructor(router, options) {
        var fs = require('fs');
        this._query = fs.readFileSync(options.query, "ascii");
    }
    call(request, response, options, data, sources) {
        return new Promise((resolve, reject) => {
            var query = this.resolveBracketsMarkup(this._query, {
                data: data,
                options: options,
                request: {
                    query: request.query,
                    body: request.body
                }
            });
            var mysqlSource = sources[options.source];
            mysqlSource.query(query).then((result) => {
                resolve({
                    resolved: {
                        result: result
                    }
                });
            }).catch((ex) => {
                reject(ex);
            });
            resolve(options);
        });
    }
    resolveBracketsMarkup(markup, models) {
        try {
            var markupRegex = /{{(.[\s\S]*?)}}/m; //TODO: il tag singleline (s) è supportato soltanto in ES2018; da modificare se si vogliono gestire le interruzioni linea \n
            var str = markup;
            var match = markupRegex.exec(str);
            while (match) {
                var valuePath = match[1];
                valuePath = valuePath.trim();
                var value = Runtime.getProperty(models, valuePath);
                str = str.replace(match[0], value);
                match = markupRegex.exec(str);
            }
            return str;
        }
        catch (ex) {
            console.error("resolve markup error: " + ex);
            return markup;
        }
    }
}
class Runtime {
    static getParentInstance(data, exp) {
        var vars = exp.split(/[.\[\]]/);
        var _data = data;
        vars = vars.filter((value) => {
            return value != "";
        });
        if (vars.length == 1) {
            return _data[vars[0]];
        }
        for (var i = 0; i < vars.length - 1; i++) {
            _data = _data[vars[i]];
        }
        return _data;
    }
    static getProperty(data, exp) {
        var vars = exp.split(".");
        var value = data;
        for (var i = 0; i < vars.length; i++) {
            value = this.getItem(value, vars[i]);
        }
        return value;
    }
    static setProperty(exp, data, value) {
        var vars = exp.split(".");
        var _data = data;
        for (var i = 0; i < vars.length - 1; i++) {
            _data = this.getItem(_data, vars[i]);
        }
        this.setItem(vars[vars.length - 1], _data, value);
    }
    static getParentPath(exp) {
        var vars = exp.split(/[.\[]/);
        var _path = "";
        var count = 0;
        if (vars.length == 1) {
            return vars[0];
        }
        vars.map((value) => {
            var newValue = value;
            var isArrayItem = false;
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
        var vars = exp.split(".");
        return this.getItemName(vars[vars.length - 1]);
    }
    static getItemName(exp) {
        var res = exp.split("[");
        if (res.length === 1) {
            return res[0];
        }
        var index = res[1].substring(0, res[1].length - 1);
        return index;
    }
    static getItem(data, exp) {
        var res = exp.split("[");
        if (res.length === 1) {
            return data[res[0]];
        }
        var array = res[0];
        var index = res[1].substring(0, res[1].length - 1);
        return data[array][index];
    }
    static setItem(exp, data, instance) {
        var res = exp.split("[");
        if (res.length === 1) {
            data[res[0]] = instance;
            return;
        }
        var array = res[0];
        var index = res[1].substring(0, res[1].length - 1);
        data[array][index] = instance;
    }
}
class Server {
    constructor(schema, server) {
        this._domains = {};
        this._schema = schema;
        this._server = server;
        var express = require('express');
        var body_parser = require('body-parser');
        if (!this._server) {
            this._server = express().use(body_parser.json());
        }
        this._port = this.getPortOptions();
        this._sslOptions = this.getSSLOptions();
        this.makeDomains(schema.domains);
    }
    startServer() {
        var fs = require('fs');
        var https = require('https');
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
        for (var path in domainsSchema) {
            var domainSchema = require(domainsSchema[path]);
            this._domains[path] = new Domain(path, domainSchema.getBundle());
        }
    }
    startDomains() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            for (var name in this._domains) {
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
/*const express = require('express');
const body_parser = require('body-parser');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');


class Server {
    private _app: any;
    private _router: any;
    private _options: any;
    private _sources: any;
    private _routes: any;
    private _routeHandlers: any[] = [];
    private _sourceHandlers: any = {};


    constructor(bundle: any, app?: any) {
        this._app = app;

        this._options = bundle.options;
        this._sources = bundle.sources;
        this._routes = bundle.routes;

        if(!this._app) {
            this._app = express().use(body_parser.json());
        }
        
        var route = this.getRouteOptions();

        this._router = express.Router(this.getRouterOptions());

        this._app.use(route, this._router);

        var publicOptions = this.getPublicOptions();

        if(publicOptions) {
            this._router.use(express.static(publicOptions));
        }

        this._router.use('/sf', express.static(__dirname));

        this.initRoutes();
    }
    
    startServer() {
        try {
            var port = this.getPortOptions();
            var sslOptions = this.getSSLOptions();

            if(!sslOptions) {
                this._app.listen(port, () => {
                    console.log("singlefin: http web server listening on port " + port)
                });
            }
            else {
                const privateKey = fs.readFileSync(sslOptions.privatekey, 'utf8');
                const certificate = fs.readFileSync(sslOptions.certificate, 'utf8');
                const ca = fs.readFileSync(sslOptions.ca, 'utf8');
    
                const credentials = {
                    key: privateKey,
                    cert: certificate,
                    ca: ca
                };
        
                const httpsServer = https.createServer(credentials, this._app);
    
                httpsServer.listen(port, () => {
                    console.log("singlefin: https web server listening on port " + port);
                });
            }
        }
        catch(ex) {
            console.error("singlefin: an error occurred during start http server: " + ex);
            
            return;
        }
    }

    initSources() {
        for(var key in this._sources) {
            var Source: any = this._sources[key].handler;

            var source = new Source(this._router, this._sources[key].options);

            this._sourceHandlers[key] = source;
        }
    }

    initRoutes() {
        for(var i=0; i<this._routes.length; i++) {
            this._routeHandlers.push(new RouteHandler(this._router, this._routes[i]));
        }
    }

    getRouteOptions() {
        if(this._options) {
            return this._options.route;
        }

        return "/";
    }

    getRouterOptions() {
        if(this._options) {
            return this._options.router;
        }

        return;
    }

    getPortOptions() {
        if(this._options) {
            return this._options.port;
        }

        return 3000;
    }

    getSSLOptions() {
        if(this._options) {
            return this._options.ssl;
        }

        return;
    }

    getPublicOptions() {
        if(this._options) {
            return this._options.public.path;
        }

        return;
    }
}*/
//module.exports.server = Server;
class Singlefin {
    run(serverConfigPath, app) {
        try {
            var serverConfig = require(serverConfigPath);
            var server = new Server(serverConfig, app);
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
    do(domain, request) {
        return this.handle(domain, this._routeActionsHandler, request);
    }
}
/// <reference path="routeaction.ts"/>
class ModelAction extends RouteAction {
    handle(domain, routeActionsHandler, request) {
        return new Promise((resolve, reject) => {
            var modelMap = request.singlefin.modelMap;
            var instance = modelMap.getParentInstance(this.parameters);
            var method = modelMap.getValue(this.parameters);
            method.call(instance, domain, request).then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    }
}
/// <reference path="routeaction.ts"/>
class NullAction extends RouteAction {
    handle(domain, routeActionsHandler, request) {
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
    inform(event, request) {
        return new Promise((resolve, reject) => {
            var routeActions = this._routeActions[event];
            this.performRouteActions(0, routeActions, request).then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    }
    performRouteActions(index, routeActions, request) {
        return new Promise((resolve, reject) => {
            if (!routeActions) {
                return resolve();
            }
            if (index >= routeActions.length) {
                return resolve();
            }
            routeActions[index].do(this._domain, request).then(() => {
                index++;
                return this.performRouteActions(index, routeActions, request);
            }).then(() => {
                return resolve();
            }).catch((error) => {
                return reject(error);
            });
        });
    }
    makeActions(events) {
        for (var event in events) {
            this._routeActions[event] = [];
            this._routeActions[event] = this.makeRouteActions(events[event]);
        }
    }
    makeRouteActions(routeActions) {
        var actions = [];
        for (var i = 0; i < routeActions.length; i++) {
            actions.push(this.makeRouteAction(routeActions[i]));
        }
        return actions;
    }
    makeRouteAction(routeAction) {
        var actionType = Object.keys(routeAction)[0];
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
    handle(domain, routeActionsHandler, request) {
        return new Promise((resolve, reject) => {
            var services = domain.services;
            var service = services[this.parameters.service];
            service.call(routeActionsHandler, request.singlefin.modelMap, this.parameters, request).then(() => {
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
            this.call(route.currentRouteActionsHandler, request.singlefin.modelMap, parameters, request).then(() => {
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
    call(routeActionsHandler, modelMap, parameters, request) {
        return Promise.resolve();
    }
    reply(request, response, modelMap, parameters) {
        var data = modelMap.getValue("data");
        response.send(data);
        return Promise.resolve();
    }
}
/// <reference path="service.ts"/>
class EmptyDataService extends Service {
    run(parameters) {
        return Promise.resolve();
    }
    call(routeActionsHandler, modelMap, parameters, request) {
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
    call(routeActionsHandler, modelMap, parameters, request) {
        return Promise.resolve();
    }
    reply(request, response, modelMap, parameters) {
        var path = require('path');
        var fileName = modelMap.getValue(parameters.path);
        var filePath = path.join(__dirname, "../../../", parameters.from, fileName);
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
/*class ModelMap {
    private _models: any;
    private _map: any;


    constructor(models: any, map: any) {
        this._models = models;
        this._map = map;
    }

    getValue(property: string) {
        var valuePath = this._map[property];

        if(!valuePath) {
            throw new Error("an error occurred during get value from model map: property '" + property + "' does not exist");
        }

        return Runtime.getProperty(this._models, valuePath);
    }

    setValue(property: string, value: any) {
        var valuePath = this._map[property];

        if(!valuePath) {
            throw new Error("an error occurred during set value from model map: property '" + property + "' does not exist");
        }

        Runtime.setProperty(valuePath, this._models, value);
    }
}*/ 
/// <reference path="service.ts"/>
class MultipartService extends Service {
    constructor() {
        super(...arguments);
        this.multer = require('multer');
    }
    run(config) {
        return Promise.resolve();
    }
    call(routeActionsHandler, modelMap, parameters, request) {
        return Promise.resolve();
    }
    route(route, parameters) {
        var storage = this.multer.diskStorage({
            destination: (req, file, cb) => {
                var path = require('path');
                var storagePath = path.join(__dirname, "../../../", parameters.storage);
                cb(null, storagePath);
            },
            filename: (request, file, cb) => {
                route.inform("readfile", request).then(() => {
                    var modelMap = request.singlefin.modelMap;
                    var fileName = modelMap.getValue(parameters.file.name);
                    var fileExtension = modelMap.getValue(parameters.file.extension);
                    cb(null, fileName + "." + fileExtension);
                }).catch((error) => {
                    cb(error);
                });
            }
        });
        var upload = this.multer({ storage: storage });
        return upload.single(parameters.fieldname);
    }
    reply(request, response, modelMap, parameters) {
        return new Promise((resolve, reject) => {
            var file = request.file;
            if (!file) {
                return reject("uploadFileError");
            }
            response.end();
        });
    }
}
//# sourceMappingURL=singlefinserver.js.map