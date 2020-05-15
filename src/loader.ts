declare var require: any;

module BrowserModule {
    export class Loader {

        load(paths: string[]) {
            return new Promise((resolve, reject) => {
                require(paths, function() {
                    resolve();
                }, function (error: any) {
                    reject(error);
                });
            });
        }

        getInstance(path: string) {
            return require(path);
        }
    }
}