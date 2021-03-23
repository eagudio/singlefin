class EmptyDataService implements Service {
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
        response.end();

        return Promise.resolve();
    }
}