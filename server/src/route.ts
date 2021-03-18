class Route {
    private _config: any;
    private _domain: Domain;
    private _route: string;
    private _method: string;
    private _modelClasses: any;
    private _service: Service = new DataService();
    private _events: any = {};


    constructor(domain: any, services: any, modelClasses: any, route: string, config: any) {
        this._domain = domain;
        this._route = route;
        this._modelClasses = modelClasses;

        this._config = config;

        this._method = config.method;
        
        this.makeService(services, config.service);
        this.makeEvents(config.events);

        this.initRouting();
    }

    initRouting() {
        if(!this._method) {
            this._method = "get";
        }

        this._domain.router[this._method](this._route, this._service.getMiddlewares(), (request: any, response: any) => {
            var models = this.initModels();
            var modelMap: ModelMap = new ModelMap(models, this._config.models);

            this.onRequest(request, response, models).then(() => {
                return this._service.onRequest(request, response, modelMap, this._config);
            }).then(() => {
                return this.onResponse(request, response, models);
            }).then(() => {
                return this._service.onResponse(request, response, modelMap, this._config);
            }).then(() => {
                
            }).catch((error: string) => {
                response.status(400);
        
                response.send(error);
            });
        });
    }

    onRequest(request: any, response: any, models: any) {
        return new Promise<void>(async (resolve, reject) => {
            var routeEvents: RouteEvent[] = this._events["request"];

            if(routeEvents) {
                for(var i=0; i<routeEvents.length; i++) {
                    await routeEvents[i].handle(this._domain, request, response, models).catch((error: string) => {
                        return reject(error);
                    });
                }
            }

            resolve();
        });
    }

    onResponse(request: any, response: any, models: any) {
        return new Promise<void>(async (resolve, reject) => {
            var routeEvents: RouteEvent[] = this._events["response"];

            if(routeEvents) {
                for(var i=0; i<routeEvents.length; i++) {
                    await routeEvents[i].handle(this._domain, request, response, models).catch((error: string) => {
                        return reject(error);
                    });
                }
            }

            resolve();
        });
    }

    initModels() {
        var models: any = {};

        for(var key in this._modelClasses) {
            var Model = this._modelClasses[key];

            models[key] = new Model();
        }

        return models;
    }

    makeService(services: any, serviceName: string) {
        if(!serviceName) {
            this._service = new EmptyDataService();
        }

        if(serviceName == "data") {
            this._service = new DataService();
        }

        if(serviceName == "file") {
            this._service = new FileService();
        }

        if(serviceName == "multipart") {
            this._service = new MultipartService();
        }

        if(services[serviceName]) {
            this._service = services[serviceName];
        }
    }

    makeEvents(events: any) {
        for(var key in events) {
            this._events[key] = [];

            this._events[key] = this.makeRouteEvents(events[key]);
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
}