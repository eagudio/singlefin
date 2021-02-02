class Route {
    private _config: any;
    private _domain: Domain;
    private _route: string;
    private _method: string;
    private _modelsMap: any;
    private _models: any;
    private _service: Service = new DataService();
    private _events: any = {};


    constructor(domain: any, services: any, models: any, route: string, config: any) {
        this._domain = domain;
        this._route = route;
        this._models = models;

        this._config = config;

        this._method = config.method;
        this._modelsMap = config.models;
        
        this.makeService(services, config.service);
        this.makeEvents(config.events);

        this.initRouting();
    }

    initRouting() {
        if(!this._method) {
            this._method = "get";
        }

        this._domain.router[this._method](this._route, (request: any, response: any) => {
            this.onRequest(request, response);

            var models = this.resolveModels();

            this._service.onRequest(request, response, models, this._config).then(() => {
                this.onResponse(request, response);

                var models = this.resolveModels();
    
                return this._service.onResponse(request, response, models, this._config);
            }).then(() => {
                
            }).catch((error: string) => {
                response.status(400);
        
                response.send(error);
            });
        });
    }

    onRequest(request: any, response: any) {
        var routeEvents: RouteEvent[] = this._events["request"];

        if(routeEvents) {
            for(var i=0; i<routeEvents.length; i++) {
                routeEvents[i].handle(this._domain, request, response, this._models);
            }
        }
    }

    onResponse(request: any, response: any) {
        var routeEvents: RouteEvent[] = this._events["response"];

        if(routeEvents) {
            for(var i=0; i<routeEvents.length; i++) {
                routeEvents[i].handle(this._domain, request, response, this._models);
            }
        }
    }

    makeService(services: any, serviceName: string) {
        if(!serviceName) {
            return;
        }

        if(serviceName == "file") {
            this._service = new FileService();
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

    resolveModels() {
        var models: any = {};

        for(var key in this._modelsMap) {
            models[key] = Runtime.getProperty(this._models, this._modelsMap[key])
        }

        return models;
    }
}