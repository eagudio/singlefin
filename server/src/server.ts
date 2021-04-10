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

        let express = require('express');
        let body_parser = require('body-parser');

        if(!this._server) {
            this._server = express().use(body_parser.json());
        }

        this._port = this.getPortOptions();
        this._sslOptions = this.getSSLOptions();

        this.makeDomains(schema.domains);
    }

    startServer() {
        let fs = require('fs');
        let https = require('https');

        this.startDomains().then(() => {
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
        }).catch((error) => {
            console.error("singlefin: an error occurred during start http server: " + error);
        });
    }

    makeDomains(domainsSchema: any) {
        if(!domainsSchema) {
            return;
        }

        for(let path in domainsSchema) {
            let domainSchema = require(domainsSchema[path]);

            this._domains[path] = new Domain(path, domainSchema.getBundle());
        }
    }

    startDomains() {
        return new Promise<void>(async (resolve, reject) => {
            for(let name in this._domains) {
                await this._domains[name].create(this._server).then(() => {
                    
                }).catch(() => {
                    return reject();
                });
            }

            resolve();
        });
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
