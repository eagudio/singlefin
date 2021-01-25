class RoutePromise {
    private _router: any;
    private _handler: string;
    private _pattern: string;
    private _route: any;
    private _options: any;
    private _then: any;
    private _catch: any;
    private _thenRouteMap: any = {};
    private _catchRoute: any;

    constructor(router: any, config: any) {
        this._router = router;
        this._handler = config.handler;
        this._pattern = config.pattern;
        this._options = config.options;
        this._then = config.then;
        this._catch = config.catch;

        this.makeRoute();

        this.makeThenRouteMap();
        this.makeCatchRouteMap();
    }

    hasCallMethod() {
        return !this._route.call ? false : true;
    }

    call(request: any, response: any, data?: any) {
        return this._route.call(request, response, this._options, data).then((result: any) => {
            var route = null;
            var send = null;
            var data = result;
            
            if(result) {
                var objKey = Object.keys(result)[0];

                if(objKey == "route") {
                    var routeObj = result[objKey];

                    route = Object.keys(routeObj)[0];
                    data = routeObj[route];
                }
                else if(objKey == "send") {
                    var sendObj = result[objKey];

                    send = Object.keys(sendObj)[0];
                    data = sendObj[send];
                }
            }
            
            if(route && this._thenRouteMap[route]) {
                return this._thenRouteMap[route].call(request, response, data);
            }

            return Promise.resolve(result);
        }).catch((result: any) => {
            if(this._catchRoute) {
                return this._catchRoute.call(request, response, result);
            }

            return Promise.reject(result);
        });
    }

    makeRoute() {
        try {
            if(this._pattern) {
                this._route = this.makeRouteFromPattern(this._pattern);

                return;
            }

            if(this._handler) {
                var Route: any = this._handler; //require(this._handler);

                this._route = new Route(this._router, this._options);

                return;
            }
        }
        catch(ex) {
            console.error("singlefin: an error occurred during instance route " + this._handler + " :" + ex);
        }
    }

    makeRouteFromPattern(pattern: string) {
        if(pattern == "file") {
            return new RouteFile(this._router, this._options);
        }
        else if(pattern == "query") {
            return new RouteQuery(this._router, this._options);
        }

        return null;
    }

    makeThenRouteMap() {
        if(!this._then) {
            return;
        }

        for(var route in this._then) {
            this._thenRouteMap[route] = new RoutePromise(this._router, this._then[route]);
        }
    }

    makeCatchRouteMap() {
        if(!this._catch) {
            return;
        }

        this._catchRoute = new RoutePromise(this._router, this._catch);
    }
}