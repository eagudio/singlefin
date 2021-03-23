class Route {
    private _config: any;
    private _domain: Domain;
    private _route: string;
    private _method: string;
    private _modelClasses: any;
    private _service: Service = new EmptyDataService();
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

        this._domain.router[this._method](this._route, [(request: any, response: any, next: any) => {
            var models = this.initModels();
            var modelMap: ModelMap = new ModelMap(models);

            request.singlefin = {
                models: models,
                modelMap: modelMap
            };

            next();
        }, (request: any, response: any, next: any) => {
            var models = request.singlefin.models;

            this.inform("request", request, models).then(() => {
                next();
            }).catch((error: string) => {
                next(error);
            });
        }, this._service.route(this, this._config), (request: any, response: any, next: any) => {
            var models = request.singlefin.models;

            this.inform("response", request, models).then(() => {
                next();
            }).catch((error: string) => {
                next(error);
            });
        }, (request: any, response: any, next: any) => {
            var modelMap: ModelMap = request.singlefin.modelMap;

            this._service.reply(request, response, modelMap, this._config).then(() => {
                
            }).catch((error: string) => {
                next(error);
            });
        }]);
    }

    inform(event: string, request: any, models: any) {
        return new Promise<void>(async (resolve, reject) => {
            var routeEvents: RouteEvent[] = this._events[event];

            var hasError = false;

            if(routeEvents) {
                for(var i=0; i<routeEvents.length; i++) {
                    await routeEvents[i].handle(this._domain, this, request, models).catch((error: string) => {
                        hasError = true;

                        return reject(error);
                    });
                }
            }

            if(!hasError) {
                resolve(); 
            }
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
            return;
        }

        this._service = services[serviceName];
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
        else if(eventType == "service") {
            return new ServiceEvent(routeEvent[eventType]);
        }

        return new NullEvent(eventType);
    }
}