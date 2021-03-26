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
                var _singlefin = event.data.singlefin;
                var _page: Page = event.data.page;
                var _valuePath = event.data.valuePath;
                var _model = event.data.model;
                var _data = event.data.data;

                var inputElement = $(event.currentTarget);
                var value = inputElement.val();
            
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
