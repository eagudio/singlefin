class ModelEvent implements RouteEvent {
    private _event: any;


    constructor(event: any) {
        this._event = event;
    }

    handle(domain: Domain, route: Route, request: any, models: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            var instance = Runtime.getParentInstance(models, this._event);
            var method = Runtime.getProperty(models, this._event);
    
            method.call(instance, domain, request, models).then(() => {
                resolve();
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
}