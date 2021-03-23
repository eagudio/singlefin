class FileService implements Service {
    run(parameters: any): Promise<void> {
        return Promise.resolve();
    }

    call(route: Route, request: any, parameters: any) {
        return Promise.resolve();
    }
    
    route(route: Route, parameters: any) {
        return [];
    }

    reply(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {
        var path = require('path');

        var fileName = modelMap.getValue(parameters.path);

        var filePath = path.join(__dirname, "../../../", parameters.from, fileName);
        
        response.sendFile(filePath);

        return Promise.resolve();
    }
}