/// <reference path="routeaction.ts"/>

class NullAction extends RouteAction {

    handle(domain: Domain, routeActionsHandler: RouteActionsHandler, request: any, response: any): Promise<void> {
        console.error("action not recognized: " + this.parameters);

        return Promise.reject("action not recognized: " + this.parameters);
    }
}