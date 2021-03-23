class ServiceEvent implements RouteEvent {
    private _event: any;


    constructor(event: any) {
        this._event = event;
    }

    handle(domain: Domain, route: Route, request: any, models: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            var services = domain.services;

            var service: Service = services[this._event.service];
    
            service.call(route, request, this._event).then(() => {
                resolve();
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
}