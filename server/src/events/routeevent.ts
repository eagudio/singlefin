interface RouteEvent {
    handle(domain: any, request: any, response: any, models: any): void;
}