class Domain {
    private _schema: any;

    private _path: string;
    private _options: any;
    private _router: any;
    private _routes: any[] = [];
    private _services: any = {};
    private _routeActionsHandler: RouteActionsHandler;

    
    constructor(path: string, schema: any) {
        this._schema = schema;
        
        this._path = path;

        this._options = schema.options;

        this._routeActionsHandler = new RouteActionsHandler(this, this._schema.events);
    }

    create(server: any) {
        return new Promise<void>((resolve, reject) => {
            let express = require('express');

            this._router = express.Router(this.getRouterOptions());
    
            this._router.use('/sf', express.static(__dirname));
    
            this.initStatic(this._schema.static);
    
            this.initServices(this._schema.services).then(() => {
                let models = this.initModels();
                let modelMap: ModelMap = new ModelMap(models);

                return this._routeActionsHandler.inform("initialize", {
                    singlefin: {
                        modelMap: modelMap
                    }
                });
            }).then(() => {
                this.initRoutes(this._schema.routes);

                this._router.use((error: any, request: any, response: any, next: any) => {
                    response.status(400).send(error);
                });
    
                server.use(this._path, this._router);

                resolve();
            }).catch((error: string) => {
                console.error("an error occurred during create domain: " + error);

                reject();
            });
        });
    }

    get router() {
        return this._router;
    }

    get options() {
        return this._options;
    }

    get services() {
        return this._services;
    }

    initStatic(staticSchema: any) {
        if(!staticSchema) {
            return;
        }

        for(let key in staticSchema) {
            let express = require('express');
            let path = require('path');

            this._router.use(key, express.static(path.join(__dirname, "../../../", staticSchema[key])));
        }
    }

    initRoutes(routesSchema: any) {
        if(!routesSchema) {
            return;
        }

        for(let key in routesSchema) {
            let route = new Route(this, this._services, this._schema.models, key, routesSchema[key]);

            this._routes.push(route);
        }
    }

    initModels() {
        let models: any = {};

        for(let key in this._schema.models) {
            let Model = this._schema.models[key];

            models[key] = new Model();
        }

        return models;
    }

    initServices(servicesSchema: any) {
        return new Promise<void>(async (resolve, reject) => {
            this._services["empty"] = new EmptyDataService(this);
            this._services["data"] = new DataService(this);
            this._services["file"] = new FileService(this);
            this._services["multipart"] = new MultipartService(this);

            for(let key in servicesSchema) {
                let Service = servicesSchema[key].handler;

                this._services[key] = new Service(this);
            }

            for(let key in this._services) {
                await this._services[key].run(servicesSchema[key]).then(() => {

                }).catch((error: any) =>  {
                    console.error("an error occurred during run service '" + key + "':" + error);

                    return reject();
                });
            }

            resolve();
        });
    }

    getRouterOptions() {
        if(this._schema && this._schema.router) {
            return this._schema.router;
        }

        return;
    }
}