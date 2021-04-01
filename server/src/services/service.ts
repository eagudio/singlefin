abstract class Service {
    private _domain: Domain;
    
    
    abstract run(parameters: any): Promise<void>;
    abstract call(routeActionsHandler: RouteActionsHandler, modelMap: ModelMap, parameters: any, request: any): Promise<unknown>;
    abstract reply(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown>;

    constructor(domain: any) {
        this._domain = domain;
    }

    get domain() {
        return this._domain;
    }

    route(route: Route, parameters: any): any {
        return (request: any, response: any, next: any) => {
            this.call(route.currentRouteActionsHandler, request.singlefin.modelMap, parameters, request).then(() => {
                next();
            }).catch((error) => {
                next(error);
            });
        };
    }
}

module.exports.service = Service;