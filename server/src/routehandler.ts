
class RouteHandler {
    private _router: any;
    private _method: string;
    private _path: string;
    private _routePromise: RoutePromise;


    constructor(router: any, config: any) {
        this._router = router;

        this._path = config.path;
        this._method = this.getHttpMethod(config);

        this._routePromise = new RoutePromise(router, config);

        this.use();
    }

    use() {
        if(this._routePromise.hasCallMethod()) {
            if(!this._path) {
                this._router[this._method]((request: any, response: any) => {
                    this._routePromise.call(request, response).then((result: any) => {
                        this.sendResponse(response, result);
                    }).catch((result: any) => {
                        this.sendError(response, result);
                    });
                });
            }
            else {
                this._router[this._method](this._path, (request: any, response: any) => {
                    this._routePromise.call(request, response).then((result: any) => {
                        this.sendResponse(response, result);
                    }).catch((result: any) => {
                        this.sendError(response, result);
                    });
                });
            }
        }
    }

    getHttpMethod(config: any) {
        if(!config.method) {
            if(!config.pattern) {
                return "use";
            }

            if(config.pattern == "file") {
                return "get";
            }
        }

        return config.method;
    }

    sendResponse(response: any, result: any) {
        var routeResponse: RouteResponse = this.getResponse(response, result);

        routeResponse.send();
    }

    sendError(response: any, result: any) {
        response.status(400);

        var routeResponse: RouteResponse = this.getResponse(response, result);

        routeResponse.send();
    }

    getResponse(response: any, result: any): RouteResponse {
        /*if(!result) {
            return new RouteEndResponse();
        }*/
        
        if(result.file) {
            return new RouteFileResponse(response, result);    
        }

        return new RouteDataResponse(response, result);
    }
}
