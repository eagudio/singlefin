class Route {
    private _config: any;
    private _domain: Domain;
    private _route: string;
    private _method: string;
    private _modelClasses: any;
    private _service: Service;
    private _routeActionsHandler: RouteActionsHandler;
    private _currentRouteActionsHandler: RouteActionsHandler;


    constructor(domain: any, services: any, modelClasses: any, route: string, config: any) {
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

    set currentRouteActionsHandler(currentRouteActionsHandler: RouteActionsHandler) {
        this._currentRouteActionsHandler = currentRouteActionsHandler;
    }
    
    inform(event: string, request: any): Promise<void> {
        return this._currentRouteActionsHandler.inform(event, request);
    }

    initRouting() {
        if(!this._method) {
            this._method = "get";
        }

        this._domain.router[this._method](this._route, [(request: any, response: any, next: any) => {
            var models = this.initModels();
            var modelMap: ModelMap = new ModelMap(models);

            request.singlefin = {
                modelMap: modelMap
            };

            next();
        }, (request: any, response: any, next: any) => {
            this._routeActionsHandler.inform("request", request).then(() => {
                next();
            }).catch((error: string) => {
                next(error);
            });
        }, this._service.route(this, this._config), (request: any, response: any, next: any) => {
            this._routeActionsHandler.inform("response", request).then(() => {
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
}