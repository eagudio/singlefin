module SinglefinModule {
    export class InputBinding extends ElementBinding {
        init(value: any) {
            this.update(value);
        }
        
        watch(singlefin: Singlefin, page: Page, model: any, valuePath: string, data: any, pageData: any) {
            this.htmlElement.on("change paste keyup", {
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

                let inputElement = $(event.currentTarget);
                let value = inputElement.val();
            
                Runtime.setProperty(_valuePath, _data, value);
                
                if(!_model) {
                    return;
                }

                if(!_model.on) {
                    return;
                }

                _page.eventManager.handleEvent(_singlefin, _model, "on", _page, value, event);
            });
        }

        update(value: any) {
            if(this.attribute == "value") {
                this.htmlElement.val(value);
            }
            else {
                this.htmlElement.attr(this.attribute, value);
            }
        }
    }
}
