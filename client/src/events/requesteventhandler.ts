/// <reference path="eventhandler.ts"/>

module SinglefinModule {
    export class RequestEventHandler extends EventHandler {
        handle(singlefin: Singlefin, delegate: any, page: Page, parameters: any, pageModels: any, event?: any): Promise<void> {
			return new Promise<void>((resolve, reject) => {
				let request: Request = new Request(delegate.request);

				request.call(singlefin, page, singlefin.models, parameters, pageModels).then(() => {
					resolve();
				}).catch((ex: any) => {
					reject(ex);
				});
			});
		}
    }
}