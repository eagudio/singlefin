/// <reference path="service.ts"/>

class MultipartService extends Service {
    private multer: any = require('multer');


    run(config: any): Promise<void> {
        return Promise.resolve();
    }

    call(routeActionsHandler: RouteActionsHandler, modelMap: ModelMap, parameters: any, request: any) {
        return Promise.resolve();
    }

    route(route: Route, parameters: any) {
        let storage = this.multer.diskStorage({
            destination: (req: any, file: any, cb: any) => {
                let path = require('path');

                let storagePath = path.join(__dirname, "../../../", parameters.storage);

                cb(null, storagePath);
            },
            filename: (request: any, file: any, cb: any) => {
                route.inform("readfile", request).then(() => {
                    let modelMap: ModelMap = request.singlefin.modelMap;

                    let fileName = modelMap.getValue(parameters.file.name);
                    let fileExtension = modelMap.getValue(parameters.file.extension);

                    cb(null, fileName + "." + fileExtension);
                }).catch((error: any) => {
                    cb(error);
                });
            }
        });
        
        let upload = this.multer({ storage: storage });

        return upload.single(parameters.fieldname);
    }

    reply(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {
        return new Promise((resolve, reject) => {
            let file = request.file;

            if (!file) {
                return reject("uploadFileError")
            }

            response.end();
        });        
    }
}