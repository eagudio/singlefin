class EmptyDataService implements Service {
    getMiddlewares() {
        return [];
    }
    
    onRequest(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {
        return Promise.resolve();
    }

    onResponse(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {        
        response.end();

        return Promise.resolve();
    }
}