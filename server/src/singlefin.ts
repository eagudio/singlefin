
class Singlefin {
    run(serverConfigPath: string, app?: any) {
        try {
            let serverConfig = require(serverConfigPath);
        
            let server = new Server(serverConfig, app);
    
            if(!app) {
                server.startServer();
            }
        }
        catch(ex) {
            console.error("singlefin: bundle error: " + ex);
        }
    }
}

module.exports.singlefin = new Singlefin();