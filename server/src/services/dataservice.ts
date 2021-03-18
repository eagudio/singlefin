class DataService implements Service {
    getMiddlewares() {
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