class DataService implements Service {
    run(parameters: any): Promise<void> {
        return Promise.resolve();
    }

    call(route: Route, request: any, parameters: any) {
        return Promise.resolve();
    }
    
    route(route: Route, parameters: any) {
        return [];
    }

    reply(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {
        var data = modelMap.getValue("data");
        
        response.send(data);

        return Promise.resolve();
    }
}