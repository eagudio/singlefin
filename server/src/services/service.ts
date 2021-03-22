interface Service {
    run(parameters: any): Promise<void>;
    onRoute(route: Route, parameters: any): any;
    onRequest(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown>;
    onResponse(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown>;
}