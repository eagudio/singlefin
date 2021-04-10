/// <reference path="service.ts"/>

class DataService extends Service {
    run(parameters: any): Promise<void> {
        return Promise.resolve();
    }

    call(routeActionsHandler: RouteActionsHandler, modelMap: ModelMap, parameters: any, request: any) {
        return Promise.resolve();
    }

    reply(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {
        let data = modelMap.getValue("data");
        
        response.send(data);

        return Promise.resolve();
    }
}