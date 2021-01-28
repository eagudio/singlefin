class RouteQuery {
    private _query: string;

    
    constructor(router: any, options: any) {
        var fs = require('fs');
        
        this._query = fs.readFileSync(options.query, "ascii");
    }

    call(request: any, response: any, options: any, data: any, sources: any) {
        return new Promise((resolve, reject) => {
            var query = this.resolveBracketsMarkup(this._query, {
                data: data,
                options: options,
                request: {
                    query: request.query,
                    body: request.body
                }
            });

            var mysqlSource = sources[options.source];

            mysqlSource.query(query).then((result: any) => {
                resolve({
                    resolved: {
                        result: result
                    }
                });
            }).catch((ex: any) => {
                reject(ex);
            });

            resolve(options);
        });
    }

    resolveBracketsMarkup(markup: string, models: any): string {
        try {
            var markupRegex = /{{(.[\s\S]*?)}}/m; //TODO: il tag singleline (s) è supportato soltanto in ES2018; da modificare se si vogliono gestire le interruzioni linea \n
            
            var str = markup;

            var match = markupRegex.exec(str);
            
            while(match) {
                var valuePath = match[1];				

                valuePath = valuePath.trim();

                var value: any = Runtime.getProperty(models, valuePath);

                str = str.replace(match[0], value);

                match = markupRegex.exec(str);
            }

            return str;
        }
        catch(ex) {
            console.error("resolve markup error: " + ex);
            
            return markup;
        }
    }
}
