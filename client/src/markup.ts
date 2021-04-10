module SinglefinModule {
    export class Markup {
        private _text: string;


        constructor(text: string) {
            this._text = text;
        }

        resolve(models: any, refModels: any, pageModels: any, pageIndex: number) {
            try {
				let markupRegex = /{{(.[\s\S]*?)}}/m; //TODO: il tag singleline (s) è supportato soltanto in ES2018; da modificare se si vogliono gestire le interruzioni linea \n

				let match = markupRegex.exec(this._text);
				
				while(match) {
					let isRefModelsResolved: boolean = this.resolveModelsReference(match[0], refModels, match[1], models, pageIndex);
                    let isPageModelsResolved: boolean = this.resolveModelsReference(match[0], pageModels, match[1], models, pageIndex);

                    if(!isRefModelsResolved && !isPageModelsResolved) {
                        let valuePath = match[1].replace(".$", "[" + pageIndex + "]");

                        let value: any = Runtime.getProperty(models, valuePath);
    
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
            let valuePath = modelPath.replace(".$", "[" + pageIndex + "]");
            valuePath = valuePath.trim();

            if(refModels) {
                if(refModels[valuePath]) {
                    let ref = refModels[valuePath].ref;

                    if(typeof ref !== "string") {
                        let mapPath = ref.map.replace(".$", "[" + pageIndex + "]");
                        let map: any = Runtime.getProperty(models, mapPath);

                        let keyPath = ref.key.replace(".$", "[" + pageIndex + "]");
                        let key: any = Runtime.getProperty(models, keyPath);

                        if(map[key] !== undefined) {
                            this._text = this._text.replace(text, map[key]);

                            return true;
                        }
                        else if(ref.default){
                            let defaultValuePath = ref.default.replace(".$", "[" + pageIndex + "]");
                            let defaultValue: any = Runtime.getProperty(models, defaultValuePath);

                            this._text = this._text.replace(text, defaultValue);

                            return true;
                        }
                    }
                    else {
                        valuePath = ref.replace(".$", "[" + pageIndex + "]");

                        let value: any = Runtime.getProperty(models, valuePath);

                        this._text = this._text.replace(text, value);
                    }
                }
            }

            return false;
        }
    }
}