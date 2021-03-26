module SinglefinModule {
    export class ShowBinding extends ElementBinding {
        init(value: any) {
            this.update(value);
        }
        
        watch(singlefin: Singlefin, page: Page, model: any, valuePath: string, data: any, pageData: any) {
            
        }

        update(value: any) {
            if(!value) {
                this.htmlElement.attr("singlefin-status", "hide");
            }
            else {
                if(this.htmlElement.attr("singlefin-status") == "hide") {
                    this.htmlElement.attr("singlefin-status", "show");
                }
            }
        }
    }
}
