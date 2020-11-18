declare function require(name:string): any;
const process = require('process');


module SinglefinBundleModule {
    var schemaPath = process.argv[2];
    var targetPath = process.argv[3];

    var schema = require(schemaPath);
    
    var bundle = new Bundle();

    bundle.make(schema, targetPath);
}