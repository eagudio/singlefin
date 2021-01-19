
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
    }

    call() {
        if(this._routePromise.hasCallMethod()) {
            if(!this._path) {
                this._router[this._method]((request: any, response: any) => {
                    this._routePromise.call(request, response).then((result: any) => {
                        //TODO: invio risposta...
                    }).catch((result: any) => {
                        //TODO: invio risposta...
                    });
                });
            }
            else {
                this._router[this._method](path, (request: any, response: any) => {
                    this._routePromise.call(request, response).then((result: any) => {
                        //TODO: invio risposta...
                    }).catch((result: any) => {
                        //TODO: invio risposta...
                    });
                });
            }
        }
    }

    getHttpMethod(config: any) {
        if(!config.method) {
            return "use";
        }

        return config.method;
    }
}
