"use strict";
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
const express = require('express');
const body_parser = require('body-parser');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
class Server {
    constructor(bundle, app) {
        this._routeHandlers = [];
        this._sourceHandlers = {};
        this._app = app;
        this._options = bundle.options;
        this._sources = bundle.sources;
        this._routes = bundle.routes;
        if (!this._app) {
            this._app = express().use(body_parser.json());
        }
        var route = this.getRouteOptions();
        this._router = express.Router(this.getRouterOptions());
        this._app.use(route, this._router);
        var publicOptions = this.getPublicOptions();
        if (publicOptions) {
            this._router.use(express.static(publicOptions));
        }
        this._router.use('/sf', express.static(__dirname));
        this.initRoutes();
    }
    startServer() {
        try {
            var port = this.getPortOptions();
            var sslOptions = this.getSSLOptions();
            if (!sslOptions) {
                this._app.listen(port, () => {
                    console.log("singlefin: http web server listening on port " + port);
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
        catch (ex) {
            console.error("singlefin: an error occurred during start http server: " + ex);
            return;
        }
    }
    initSources() {
        for (var key in this._sources) {
            var Source = this._sources[key].handler;
            var source = new Source(this._router, this._sources[key].options);
            this._sourceHandlers[key] = source;
        }
    }
    initRoutes() {
        for (var i = 0; i < this._routes.length; i++) {
            this._routeHandlers.push(new RouteHandler(this._router, this._routes[i]));
        }
    }
    getRouteOptions() {
        if (this._options) {
            return this._options.route;
        }
        return "/";
    }
    getRouterOptions() {
        if (this._options) {
            return this._options.router;
        }
        return;
    }
    getPortOptions() {
        if (this._options) {
            return this._options.port;
        }
        return 3000;
    }
    getSSLOptions() {
        if (this._options) {
            return this._options.ssl;
        }
        return;
    }
    getPublicOptions() {
        if (this._options) {
            return this._options.public.path;
        }
        return;
    }
}
//module.exports.server = Server;
class Singlefin {
    run(bundlePath, app) {
        try {
            var serverBundle = require(bundlePath);
            var server = new Server(serverBundle.getBundle(), app);
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
//# sourceMappingURL=singlefinserver.js.map