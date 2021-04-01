/// <reference path="service.ts"/>

class FileService extends Service {
    run(parameters: any): Promise<void> {
        return Promise.resolve();
    }

    call(routeActionsHandler: RouteActionsHandler, modelMap: ModelMap, parameters: any, request: any) {
        return Promise.resolve();
    }

    reply(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {
        var path = require('path');

        var fileName = modelMap.getValue(parameters.path);

        var filePath = path.join(__dirname, "../../../", parameters.from, fileName);
        
        response.sendFile(filePath);

        return Promise.resolve();
    }
}