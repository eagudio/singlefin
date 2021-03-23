interface Service {
    run(parameters: any): Promise<void>;
    call(route: Route, request: any, parameters: any): Promise<unknown>;
    route(route: Route, parameters: any): any;
    reply(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown>;
}