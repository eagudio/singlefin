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
                let _singlefin = event.data.singlefin;
                let _page: Page = event.data.page;
                let _valuePath = event.data.valuePath;
                let _model = event.data.model;
                let _data = event.data.data;

                let inputElement = event.currentTarget;

                if(inputElement.files && inputElement.files[0]) {
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
