abstract class RouteAction {
    private _parameters: any;
    private _routeActionsHandler: RouteActionsHandler;


    constructor(domain: Domain, parameters: any) {
        this._parameters = parameters;

        this._routeActionsHandler = new RouteActionsHandler(domain, parameters.events);
    }

    get parameters() {
        return this._parameters;
    }

    do(domain: Domain, request: any, response: any) {
        return this.handle(domain, this._routeActionsHandler, request, response);
    }

    abstract handle(domain: Domain, routeActionsHandler: RouteActionsHandler, request: any, response: any): Promise<void>;
}