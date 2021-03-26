/// <reference path="eventhandler.ts"/>

module SinglefinModule {
    export class ModelEventHandler extends EventHandler {
        handle(singlefin: Singlefin, delegate: any, page: Page, parameters: any, pageModels: any, event?: any): Promise<void> {
			return new Promise<void>((resolve, reject) => {
				if(pageModels) {
					var modelMethodName = Runtime.getPropertyName(delegate.model);
	
					if(pageModels[modelMethodName]) {
						var pageModelMethodName = pageModels[modelMethodName].ref;
						
						if(!pageModelMethodName) {
							this.eventManager.handleEvent(singlefin, pageModels[modelMethodName], "on", page, parameters, pageModels).then(() => {
								return resolve();
							}).catch((ex: any) => {
								return reject(ex);
							});
						}
						else {
							var model = Runtime.getParentInstance(singlefin.models, pageModelMethodName);
							var modelMethod = Runtime.getProperty(singlefin.models, pageModelMethodName);
	
							modelMethod.call(model, page.app, page, singlefin.models, parameters, event).then(() => {
								if(!pageModels[modelMethodName].on) {
									return resolve();
								}
								
								this.eventManager.handleEvent(singlefin, pageModels[modelMethodName], "on", page, parameters, pageModels).then(() => {
									return resolve();
								}).catch((ex: any) => {
									return reject(ex);
								});
							}).catch((ex: any) => {
								return reject(ex);
							});
						}
					}
				}
	
				var model = Runtime.getParentInstance(singlefin.models, delegate.model);
				var modelMethod = Runtime.getProperty(singlefin.models, delegate.model);

				modelMethod.call(model, page.app, page, singlefin.models, parameters, event).then(() => {
					page.eventManager.handleEvent(singlefin, delegate, "resolved", page, parameters, null).then(() => {
						return resolve();
					}).catch((ex: any) => {
						return reject(ex);
					});
				}).catch((ex: any) => {
					page.eventManager.handleEvent(singlefin, delegate, "rejected", page, parameters, null).then(() => {
						return resolve();
					}).catch((ex: any) => {
						return reject(ex);
					});
				});
			});
		}
    }
}