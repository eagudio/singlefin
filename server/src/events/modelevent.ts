class ModelEvent implements RouteEvent {
    private _event: any;


    constructor(event: any) {
        this._event = event;
    }

    handle(domain: any, request: any, response: any, models: any): Promise<void> {
        var instance = Runtime.getParentInstance(models, this._event);
        var method = Runtime.getProperty(models, this._event);

		return method.call(instance, domain, request, response, models);
    }
}