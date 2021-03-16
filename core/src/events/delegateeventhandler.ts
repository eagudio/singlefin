/// <reference path="eventhandler.ts"/>

module SinglefinModule {
    export class DelegateEventHandler extends EventHandler {
        handle(singlefin: Singlefin, delegate: any, page: Page, parameters: any, pageModels: any, event?: any): Promise<void> {
			return new Promise<void>((resolve, reject) => {
				if(delegate.event.preventDefault == true) {
					event.preventDefault();

					if(!delegate.event.delegate) {
						return resolve();
					}
				}

				if(!delegate.event.delegate) {
					return reject("method '" + delegate.event + "' not supported");
				}
				
				this.eventManager.handleEvent(singlefin, page.events, delegate.event.delegate, page, parameters, pageModels).then(() => {
					return resolve();
				}).catch((ex: any) => {
					return reject(ex);
				});
			});
		}
    }
}