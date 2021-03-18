class MultipartService implements Service {
    private multer: any = require('multer');
    private upload: any;

    
    constructor() {
        var storage = this.multer.diskStorage({
            destination: function (req: any, file: any, cb: any) {
                cb(null, 'uploads')
            },
            filename: function (req: any, file: any, cb: any) {
                cb(null, file.fieldname + '-' + Date.now())
            }
        });
        
        this.upload = this.multer({ storage: storage })
    }

    getMiddlewares() {
        return [this.upload.single('attachment')];
    }
    
    onRequest(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {
        return Promise.resolve();
    }

    onResponse(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {
        //var multer  = require('multer')
        //var upload = multer({ dest: 'uploads/' })

        console.log("multiparteservice");
        console.log(parameters);

        return Promise.resolve();
    }
}