interface Service {
    onRequest(request: any, response: any, models: any, config: any): Promise<unknown>;
    onResponse(request: any, response: any, models: any, config: any): Promise<unknown>;
}