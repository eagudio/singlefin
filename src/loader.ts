declare var require: any;

module SinglefinModule {
    export class Loader {

        load(paths: string[]) {
            return new Promise((resolve, reject) => {
                require(paths, function() {
                    resolve();
                }, function (error: any) {
                    console.error("load module error: " + error);

                    reject("load module error: " + error);
                });
            });
        }

        getInstance(path: string) {
            return require(path);
        }
    }
}