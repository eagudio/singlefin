class NullEvent implements RouteEvent {
    private _eventType: any;


    constructor(eventType: any) {
        this._eventType = eventType;
    }

    handle(domain: any, request: any, response: any, models: any): void {
        console.error("event not recognized: " + this._eventType);
    }
}