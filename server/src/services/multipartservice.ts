class MultipartService implements Service {
    private multer: any = require('multer');
    private upload: any;
    private storagePath: string = "";

    
    constructor() {
        var path = require('path');

        this.storagePath = path.join(__dirname, "../../../", "uploads");

        var storage = this.multer.diskStorage({
            destination: (req: any, file: any, cb: any) => {
                cb(null, this.storagePath)
            },
            filename: (req: any, file: any, cb: any) => {
                cb(null, file.fieldname + '-' + Date.now() + ".jpg")
            }
        });
        
        this.upload = this.multer({ storage: storage })
    }

    getMiddlewares() {
        return [this.upload.single('content')];
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

            response.send(file);
        });        
    }
}