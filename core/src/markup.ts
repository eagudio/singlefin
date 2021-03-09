module SinglefinModule {
    export class Markup {
        private _text: string;


        constructor(text: string) {
            this._text = text;
        }

        resolve(models: any, refModels: any, pageModels: any, pageIndex: number) {
            try {
				var markupRegex = /{{(.[\s\S]*?)}}/m; //TODO: il tag singleline (s) è supportato soltanto in ES2018; da modificare se si vogliono gestire le interruzioni linea \n

				var match = markupRegex.exec(this._text);
				
				while(match) {
					var isRefModelsResolved: boolean = this.resolveModelsReference(match[0], refModels, match[1], models, pageIndex);
                    var isPageModelsResolved: boolean = this.resolveModelsReference(match[0], pageModels, match[1], models, pageIndex);

                    if(!isRefModelsResolved && !isPageModelsResolved) {
                        var valuePath = match[1].replace(".$", "[" + pageIndex + "]");

                        var value: any = Runtime.getProperty(models, valuePath);
    
                        this._text = this._text.replace(match[0], value);
                    }

					match = markupRegex.exec(this._text);
				}

				return this._text;
            }
            catch(ex) {
                console.error("resolve markup error: " + ex);
                
                return this._text;
            }
        }

        resolveModelsReference(text: string, refModels: any, modelPath: string, models: any, pageIndex: number) {
            var valuePath = modelPath.replace(".$", "[" + pageIndex + "]");
            valuePath = valuePath.trim();

            if(refModels) {
                if(refModels[valuePath]) {
                    var ref = refModels[valuePath].ref;

                    if(typeof ref !== "string") {
                        var mapPath = ref.map.replace(".$", "[" + pageIndex + "]");
                        var map: any = Runtime.getProperty(models, mapPath);

                        var keyPath = ref.key.replace(".$", "[" + pageIndex + "]");
                        var key: any = Runtime.getProperty(models, keyPath);

                        var defaultValuePath = ref.default.replace(".$", "[" + pageIndex + "]");

                        if(map[key] !== undefined) {
                            this._text = this._text.replace(text, map[key]);

                            return true;
                        }
                        else if(defaultValuePath){
                            var defaultValue: any = Runtime.getProperty(models, defaultValuePath);

                            this._text = this._text.replace(text, defaultValue);

                            return true;
                        }
                    }
                    else {
                        valuePath = ref.replace(".$", "[" + pageIndex + "]");

                        var value: any = Runtime.getProperty(models, valuePath);

                        this._text = this._text.replace(text, value);
                    }
                }
            }

            return false;
        }
    }
}