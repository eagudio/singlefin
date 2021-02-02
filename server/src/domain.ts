class Domain {
    private _schema: any;
    private _server: any;

    private _path: string;
    private _options: any;
    private _router: any;
    private _routes: any[] = [];
    private _models: any = {};
    private _services: any = {};
    private _events: any = {};

    
    constructor(schema: any, server: any) {
        this._schema = schema;
        this._server = server;
        
        this._path = this.getPathOptions();

        this._options = schema.options;

        var express = require('express');

        this._router = express.Router(this.getRouterOptions());

        this._router.use('/sf', express.static(__dirname));

        server.use(this._path, this._router);

        this.initStatic(this._schema.static);
        this.initModels(this._schema.models);
        this.initServices(this._schema.services);
        this.initEvents(this._schema.events);
        this.initRoutes(this._schema.routes);

        this.onInitialize();
    }

    get router() {
        return this._router;
    }

    get options() {
        return this._options;
    }

    onInitialize() {
        var routeEvents: RouteEvent[] = this._events["initialize"];

        if(routeEvents) {
            for(var i=0; i<routeEvents.length; i++) {
                routeEvents[i].handle(this, null, null, this._models);
            }
        }
    }

    initStatic(staticSchema: any) {
        if(!staticSchema) {
            return;
        }

        for(var key in staticSchema) {
            var express = require('express');
            var path = require('path');

            this._router.use(key, express.static(path.join(__dirname, "../../../", staticSchema[key])));
        }
    }

    initRoutes(routesSchema: any) {
        if(!routesSchema) {
            return;
        }

        for(var key in routesSchema) {
            var route = new Route(this, this._services, this._models, key, routesSchema[key]);

            this._routes.push(route);
        }
    }

    initModels(modelsSchema: any) {
        if(!modelsSchema) {
            return;
        }

        for(var key in modelsSchema) {
            var Model = modelsSchema[key];

            var model = new Model();

            this._models[key] = model;
        }
    }

    initServices(servicesSchema: any) {
        if(!servicesSchema) {
            return;
        }

        for(var key in servicesSchema) {
            var Service = servicesSchema[key].handler;

            var service = new Service(servicesSchema[key]);

            this._services[key] = service;
        }
    }

    initEvents(eventsSchema: any) {
        for(var key in eventsSchema) {
            this._events[key] = [];

            this._events[key] = this.makeRouteEvents(eventsSchema[key]);
        }
    }

    makeRouteEvents(routeEvents: any[]) {
        var events = [];
        
        for(var i=0; i<routeEvents.length; i++) {
            events.push(this.makeRouteEvent(routeEvents[i]));
        }

        return events;
    }

    makeRouteEvent(routeEvent: any) {
        var eventType = Object.keys(routeEvent)[0];

        if(eventType == "model") {
            return new ModelEvent(routeEvent[eventType]);
        }

        return new NullEvent(eventType);
    }

    getRouterOptions() {
        if(this._schema) {
            return this._schema.router;
        }

        return;
    }

    getPathOptions() {
        if(this._schema) {
            return this._schema.path;
        }

        return "/";
    }
}