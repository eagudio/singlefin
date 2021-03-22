class DataService implements Service {
    run(parameters: any): Promise<void> {
        return Promise.resolve();
    }
    
    onRoute(route: Route, parameters: any) {
        return [];
    }
    
    onRequest(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {
        return Promise.resolve();
    }

    onResponse(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {
        var data = modelMap.getValue("data");
        
        response.send(data);

        return Promise.resolve();
    }
}