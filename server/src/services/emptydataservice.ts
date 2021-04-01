/// <reference path="service.ts"/>

class EmptyDataService extends Service {
    run(parameters: any): Promise<void> {
        return Promise.resolve();
    }

    call(routeActionsHandler: RouteActionsHandler, modelMap: ModelMap, parameters: any, request: any) {
        return Promise.resolve();
    }

    reply(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {        
        response.end();

        return Promise.resolve();
    }
}