
class Singlefin {
    run(bundlePath: string, app?: any) {
        try {
            var serverBundle = require(bundlePath);
        
            var server = new Server(serverBundle.getBundle(), app);
    
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