class FileService {
    onRequest(request: any, response: any, models: any, config: any): Promise<unknown> {
        return Promise.resolve();
    }

    onResponse(request: any, response: any, models: any, config: any): Promise<unknown> {
        var path = require('path');

        var filePath = path.join(__dirname, "../../../", config.from, models.path);
        
        response.sendFile(filePath);

        return Promise.resolve();
    }
}