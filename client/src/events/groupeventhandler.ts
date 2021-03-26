/// <reference path="eventhandler.ts"/>

module SinglefinModule {
    export class GroupEventHandler extends EventHandler {
        handle(singlefin: Singlefin, delegate: any, page: Page, parameters: any, pageModels: any, event?: any): Promise<void> {
			return new Promise<void>((resolve, reject) => {
				if(delegate.group.open) {
					singlefin.openGroupPage(delegate.group.open, delegate.group.page, delegate.group.parameters, delegate.group.models).then(() => {
						return resolve();
					}).catch((ex: any) => {
						return reject(ex);
					});
				}

				if(delegate.group.reset) {
					singlefin.resetGroupPage(delegate.group.reset);

					return resolve();
				}
			});
		}
    }
}