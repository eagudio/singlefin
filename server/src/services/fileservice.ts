class FileService implements Service {
    run(parameters: any): Promise<void> {
        return Promise.resolve();
    }
    
    onRoute(route: Route, parameters: any) {
        return [];
    }
    
    onRequest(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {
        return Promise.resolve();
    }

    onResponse(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {
        var path = require('path');

        var fileName = modelMap.getValue("path");

        var filePath = path.join(__dirname, "../../../", parameters.from, fileName);
        
        response.sendFile(filePath);

        return Promise.resolve();
    }
}