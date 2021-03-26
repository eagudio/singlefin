/// <reference path="eventhandler.ts"/>

module SinglefinModule {
    export class BrowserEventHandler extends EventHandler {
        handle(singlefin: Singlefin, delegate: any, page: Page, parameters: any, pageModels: any, event?: any): Promise<void> {
			if(delegate.browser == "refresh") {
				window.location.reload();
			}

			return Promise.resolve();
		}
    }
}