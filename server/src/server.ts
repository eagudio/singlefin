class Server {
    private _schema: any;

    private _port: number;
    private _sslOptions: any;
    private _server: any;
    private _domains: any = {};

    private _httpsServer: any;


    constructor(schema: any, server?: any) {
        this._schema = schema;
        this._server = server;

        var express = require('express');
        var body_parser = require('body-parser');

        if(!this._server) {
            this._server = express().use(body_parser.json());
        }

        this._port = this.getPortOptions();
        this._sslOptions = this.getSSLOptions();

        this.makeDomains(schema.domains);
    }

    startServer() {
        try {
            var fs = require('fs');
            var https = require('https');

            if(!this._sslOptions) {
                this._server.listen(this._port, () => {
                    console.log("singlefin: http web server listening on port " + this._port)
                });
            }
            else {
                const privateKey = fs.readFileSync(this._sslOptions.privatekey, 'utf8');
                const certificate = fs.readFileSync(this._sslOptions.certificate, 'utf8');
                const ca = fs.readFileSync(this._sslOptions.ca, 'utf8');
    
                const credentials = {
                    key: privateKey,
                    cert: certificate,
                    ca: ca
                };
        
                this._httpsServer = https.createServer(credentials, this._server);
    
                this._httpsServer.listen(this._port, () => {
                    console.log("singlefin: https web server listening on port " + this._port);
                });
            }
		}
		catch(ex) {
			console.error("singlefin: an error occurred during start http server: " + ex);
			
			return;
		}
    }

    makeDomains(domainsSchema: any) {
        if(!domainsSchema) {
            return;
        }

        for(var name in domainsSchema) {
            this._domains[name] = new Domain(domainsSchema[name], this._server);
        }
    }

    getPortOptions() {
        if(this._schema.port) {
            return this._schema.port;
        }

        return 3000;
    }

    getSSLOptions() {
        if(this._schema.ssl) {
            return this._schema.ssl;
        }

        return;
    }
}

/*const express = require('express');
const body_parser = require('body-parser');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');


class Server {
    private _app: any;
    private _router: any;
    private _options: any;
    private _sources: any;
    private _routes: any;
    private _routeHandlers: any[] = [];
    private _sourceHandlers: any = {};


    constructor(bundle: any, app?: any) {
        this._app = app;

        this._options = bundle.options;
        this._sources = bundle.sources;
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

        this._router.use('/sf', express.static(__dirname));

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

    initSources() {
        for(var key in this._sources) {
            var Source: any = this._sources[key].handler;

            var source = new Source(this._router, this._sources[key].options);

            this._sourceHandlers[key] = source;
        }
    }

    initRoutes() {
        for(var i=0; i<this._routes.length; i++) {
            this._routeHandlers.push(new RouteHandler(this._router, this._routes[i]));
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
}*/

//module.exports.server = Server;