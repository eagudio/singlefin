class RouteFileResponse implements RouteResponse {
    private _response: any;
    private _result: any;

    constructor(response: any, result: any) {
        this._response = response;
        this._result = result;
    }

    send(): void {
        this._response.sendFile(this._result.file.name, { root: this._result.file.path });
    }
}
