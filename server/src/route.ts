class Route {
    private _router: any;
    private _patterns: any;
    private _route: string;
    private _method: string;
    private _pattern: string;


    constructor(router: any, patterns: any, route: string, config: any) {
        this._router = router;
        this._patterns = patterns;
        this._route = route;

        this._method = config.method;
        this._pattern = this.getPattern(patterns, config.pattern);
    }

    init() {
        if(!this._method) {
            this._method = "get";
        }

        //this._pattern

        this._router[this._method](this._route, (request: any, response: any) => {
            response.send("hello!!!");
        });
    }

    getPattern(patterns: any, patternName: string) {
        if(!patternName) {
            return;
        }

        return patterns[patternName];
    }
}