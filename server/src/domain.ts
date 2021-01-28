class Domain {
    private _schema: any;
    private _server: any;

    private _path: string;
    private _router: any;
    private _routes: any;
    private _routerOptions: any;
    //private _dataStore: DataStore;
    private _options: any;

    
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

        this.initPatterns(this._schema.models);

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

    }

    initModels(modelsSchema: any) {

    }

    initPatterns(modelsSchema: any) {

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