class MultipartService implements Service {
    private multer: any = require('multer');


    run(config: any): Promise<void> {
        return Promise.resolve();
    }

    onRoute(route: Route, parameters: any) {
        var storage = this.multer.diskStorage({
            destination: (req: any, file: any, cb: any) => {
                var path = require('path');

                var storagePath = path.join(__dirname, "../../../", parameters.storage);

                cb(null, storagePath);
            },
            filename: (request: any, file: any, cb: any) => {
                route.inform("readfile", request, file, request.singlefin.models).then(() => {
                    //var result = request.singlefin.modelMap.getValue("result");

                    cb(null, file.fieldname + '-' + Date.now() + ".jpg");
                });
            }
        });
        
        var upload = this.multer({ storage: storage });

        return upload.single(parameters.fieldname);
    }
    
    onRequest(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {
        return Promise.resolve();
    }

    onResponse(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {
        return new Promise((resolve, reject) => {
            var file = request.file

            if (!file) {
                return reject("uploadFileError")
            }

            response.end();
        });        
    }
}