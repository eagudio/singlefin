module SinglefinModule {
    export class ListBinding extends ElementBinding {
        private _singlefin: Singlefin;
        private _page: Page;
        private _model: any;
        
        constructor(htmlElement: any, attribute: string, property: any, singlefin: Singlefin, page: Page, model: any) {
            super(htmlElement, attribute, property);

            this._singlefin = singlefin;
            this._page = page;
            this._model = model;
        }

        init(value: any) {
            if(!this._model) {
                return;
            }
            
            ProxyHandlerMap.deleteProxyStartWith(this._model.list + "[");
        }
        
        watch(singlefin: Singlefin, page: Page, model: any, valuePath: string, data: any, pageData: any) {
            
        }

        update(value: any) {
            if(!this._model) {
                return;
            }

            ProxyHandlerMap.deleteProxyStartWith(this._model.list + "[");

            if(!this._model.on) {
                return;
            }

            this._page.eventManager.handleEvent(this._singlefin, this._model, "on", this._page, value, null);
        }
    }
}
