const express = require('express');
const body_parser = require('body-parser');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');


class Server {
    private _app: any;
    private _router: any;
    private _options: any;
    private _routes: any;
    private _routeHandlers: any[] = [];


    constructor(bundle: any, app?: any) {
        this._app = app;

        this._options = bundle.options;
        this._routes = bundle.routes;

        if(!this._app) {
            this._app = express().use(body_parser.json());
        }
        
        var route = this.getRouteOptions();

        this._router = express.Router(this.getRouterOptions());

        this._app.use(route, this._router);

        var publicOptions = this.getPublicOptions();

        if(publicOptions) {
            this._router.use(express.static(publicOptions));
        }

        this.initRoutes();
    }
    
    startServer() {
        try {
            var port = this.getPortOptions();
            var sslOptions = this.getSSLOptions();

            if(!sslOptions) {
                this._app.listen(port, () => {
                    console.log("singlefin: http web server listening on port " + port)
                });
            }
            else {
                const privateKey = fs.readFileSync(sslOptions.privatekey, 'utf8');
                const certificate = fs.readFileSync(sslOptions.certificate, 'utf8');
                const ca = fs.readFileSync(sslOptions.ca, 'utf8');
    
                const credentials = {
                    key: privateKey,
                    cert: certificate,
                    ca: ca
                };
        
                const httpsServer = https.createServer(credentials, this._app);
    
                httpsServer.listen(port, () => {
                    console.log("singlefin: https web server listening on port " + port);
                });
            }
		}
		catch(ex) {
			console.error("singlefin: an error occurred during start http server: " + ex);
			
			return;
		}
    }

    initRoutes() {
        for(var i=0; i<this._routes.length; i++) {
            try {
                this._routeHandlers.push(new RouteHandler(this._router, this._routes[i]));
            }
            catch(ex) {
                console.error("singlefin: an error occurred during handle route " + this._routes[i].use + " :" + ex);
            }
        }
    }

    getRouteOptions() {
        if(this._options) {
            return this._options.route;
        }

        return "/";
    }

    getRouterOptions() {
        if(this._options) {
            return this._options.router;
        }

        return;
    }

    getPortOptions() {
        if(this._options) {
            return this._options.port;
        }

        return 3000;
    }

    getSSLOptions() {
        if(this._options) {
            return this._options.ssl;
        }

        return;
    }

    getPublicOptions() {
        if(this._options) {
            return this._options.public.path;
        }

        return;
    }
}

//module.exports.server = Server;