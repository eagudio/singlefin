module SinglefinModule {
    export class ShowBinding extends ElementBinding {
        init(value: any) {
            this.update(value);
        }
        
        watch(singlefin: Singlefin, page: Page, model: any, valuePath: string, data: any, pageData: any) {
            
        }

        update(value: any) {
            if(value == false) {
                this.htmlElement.hide();
            }
            else {
                this.htmlElement.show();
            }
        }
    }
}
