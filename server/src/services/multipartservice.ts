class MultipartService implements Service {
    private multer: any = require('multer');


    run(config: any): Promise<void> {
        return Promise.resolve();
    }

    call(route: Route, request: any, parameters: any) {
        return Promise.resolve();
    }

    route(route: Route, parameters: any) {
        var storage = this.multer.diskStorage({
            destination: (req: any, file: any, cb: any) => {
                var path = require('path');

                var storagePath = path.join(__dirname, "../../../", parameters.storage);

                cb(null, storagePath);
            },
            filename: (request: any, file: any, cb: any) => {
                route.inform("readfile", request, request.singlefin.models).then(() => {
                    var modelMap: ModelMap = request.singlefin.modelMap;

                    var fileName = modelMap.getValue(parameters.file.name);
                    var fileExtension = modelMap.getValue(parameters.file.extension);

                    cb(null, fileName + "." + fileExtension);
                });
            }
        });
        
        var upload = this.multer({ storage: storage });

        return upload.single(parameters.fieldname);
    }

    reply(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {
        return new Promise((resolve, reject) => {
            var file = request.file;

            if (!file) {
                return reject("uploadFileError")
            }

            response.end();
        });        
    }
}