class RouteDataResponse implements RouteResponse {
    private _response: any;
    private _result: any;

    constructor(response: any, result: any) {
        this._response = response;
        this._result = result;
    }

    send(): void {
        this._response.send(this._result);
    }
}
