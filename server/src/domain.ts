class Domain {
    private _schema: any;
    private _server: any;

    private _path: string;
    private _router: any;
    private _routes: any[] = [];
    private _models: any = {};
    private _patterns: any = {};

    
    constructor(schema: any, server: any) {
        this._schema = schema;
        this._server = server;
        
        this._path = this.getPathOptions();

        var express = require('express');

        this._router = express.Router(this.getRouterOptions());

        this._router.use('/sf', express.static(__dirname));

        server.use(this._path, this._router);

        this.initDatastore(this._schema.datastore);

        this.initModels(this._schema.models);

        this.initPatterns(this._schema.patterns);

        this.initRoutes(this._schema.routes);
    }

    initDatastore(datastoreSchema: any) {
        if(!datastoreSchema) {
            return;
        }

        this.initPublicDatastore(datastoreSchema.public);
    }

    initPublicDatastore(publicDatastoreSchema: any) {
        if(!publicDatastoreSchema) {
            return;
        }

        var express = require('express');

        this._router.use(express.static(publicDatastoreSchema.path));
    }

    initRoutes(routesSchema: any) {
        if(!routesSchema) {
            return;
        }

        for(var key in routesSchema) {
            var route = new Route(this._router, this._patterns, key, routesSchema[key]);

            route.init();

            this._routes.push(route);
        }
    }

    initModels(modelsSchema: any) {
        if(!modelsSchema) {
            return;
        }

        for(var key in modelsSchema) {
            var Model = modelsSchema[key];

            var model = new Model();

            this._models[key] = model;
        }
    }

    initPatterns(patternsSchema: any) {
        if(!patternsSchema) {
            return;
        }

        for(var key in patternsSchema) {
            var Pattern = patternsSchema[key];

            var pattern = new Pattern();

            this._patterns[key] = pattern;
        }
    }

    getRouterOptions() {
        if(this._schema) {
            return this._schema.router;
        }

        return;
    }

    getPathOptions() {
        if(this._schema) {
            return this._schema.path;
        }

        return "/";
    }
}