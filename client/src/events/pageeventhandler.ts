/// <reference path="eventhandler.ts"/>

module SinglefinModule {
    export class PageEventHandler extends EventHandler {
        handle(singlefin: Singlefin, delegate: any, page: Page, parameters: any, pageModels: any, event?: any): Promise<void> {
			return new Promise<void>((resolve, reject) => {
				let pageModels: any = {};

				for(let key in delegate.page.models) {
					pageModels[key] = {};

					let valuePath = delegate.page.models[key].ref

					if(valuePath) {
						if(typeof valuePath === "string") {
							valuePath = valuePath.replace(".$", "[" + page.index + "]");
							valuePath = valuePath.trim();
						}
					}

					pageModels[key].ref = valuePath;
					pageModels[key].on = delegate.page.models[key].on;
				}

				if(delegate.page.open) {
					singlefin.open(delegate.page.open, delegate.page.parameters, pageModels).then(() => {
						return resolve();
					});
				}
				else if(delegate.page.refresh) {
					singlefin.refresh(delegate.page.refresh, delegate.page.parameters, pageModels).then(() => {
						return resolve();
					});
				}
				else if(delegate.page.close) {
					singlefin.close(delegate.page.close, delegate.page.parameters).then(() => {
						return resolve();
					});
				}
				else {
					reject("method '" + delegate.page + "' not supported");
				}
			});
		}
    }
}