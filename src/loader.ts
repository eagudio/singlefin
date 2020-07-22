declare var require: any;

module SinglefinModule {
    export class Loader {

        load(paths: string[], pathsMap: any) {
            return new Promise((resolve, reject) => {
                var normalizedPaths: string[] = this.normalizePaths(paths, pathsMap);
                
                require(normalizedPaths, function() {
                    resolve();
                }, function (error: any) {
                    console.error("load module error: " + error);

                    reject("load module error: " + error);
                });
            });
        }

        getInstance(path: string, pathsMap: any) {
            var normalizedPath: string = this.normalizePath(path, pathsMap);

            return require(normalizedPath);
        }

        normalizePath(path: string, pathsMap: any): string {
            if(!pathsMap) {
                return path;
            }

            var pathMarkup = this.resolvePath(path);

            if(pathMarkup) {
                var itemPath = pathsMap[pathMarkup[1]];

                return path.replace(pathMarkup[0], itemPath);
            }

            return path;
        }

        normalizePaths(paths: string[], pathsMap: any): string[] {
            var normalizedPaths: string[] = [];
            
            if(!pathsMap) {
                return paths;
            }

            for(var i=0; i<paths.length; i++) {
                normalizedPaths.push(this.normalizePath(paths[i], pathsMap));
            }

            return normalizedPaths;
        }
        
        resolvePath(path: string) {
            var pathRegExp = new RegExp("@([a-z0-9_-]+)");
            
            var pathMarkup = pathRegExp.exec(path);
    
            return pathMarkup;
        }
    }
}