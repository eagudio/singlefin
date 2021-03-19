module SinglefinModule {
    export class InputFileBinding extends ElementBinding {
        init(value: any) {
            
        }
        
        watch(singlefin: Singlefin, page: Page, model: any, valuePath: string, data: any, pageData: any) {
            this.htmlElement.on("change", {
                singlefin: singlefin,
                page: page,
                data: data,
                valuePath: valuePath,
                model: model
            }, (event: any) => {
                var _singlefin = event.data.singlefin;
                var _page: Page = event.data.page;
                var _valuePath = event.data.valuePath;
                var _model = event.data.model;
                var _data = event.data.data;

                var inputElement = event.currentTarget;

                if(inputElement.files && inputElement.files[0]) {
                    /*var reader = new FileReader();
                    
                    reader.onload = ((e: any) => {
                        var fileContent = e.target.result;

                        Runtime.setProperty(_valuePath, _data, fileContent);

                        if(!_model) {
                            return;
                        }
        
                        if(!_model.on) {
                            return;
                        }
        
                        _page.eventManager.handleEvent(_singlefin, _model, "on", _page, fileContent, event);
                    });
                    
                    reader.readAsDataURL(inputElement.files[0]);*/

                    Runtime.setProperty(_valuePath, _data, inputElement.files[0]);

                    if(!_model) {
                        return;
                    }
    
                    if(!_model.on) {
                        return;
                    }
    
                    _page.eventManager.handleEvent(_singlefin, _model, "on", _page, inputElement.files[0], event);
                }
            });
        }

        update(value: any) {
            
        }
    }
}
