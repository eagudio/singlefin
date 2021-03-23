interface RouteEvent {
    handle(domain: Domain, route: any, request: any, models: any): Promise<void>;
}