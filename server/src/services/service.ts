interface Service {
    getMiddlewares(): any[];
    onRequest(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown>;
    onResponse(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown>;
}