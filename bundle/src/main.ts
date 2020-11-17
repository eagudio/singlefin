declare function require(name:string): any;


module SinglefinBundleModule {
    var schema = require('../../examples/schema.json');
    
    var bundle = new Bundle();

    bundle.make(schema);
}