/// <reference path="eventhandler.ts"/>

module SinglefinModule {
    export class NullEventHandler extends EventHandler {
        handle(singlefin: Singlefin, delegate: any, page: Page, parameters: any, pageModels: any, event?: any): Promise<void> {
			return Promise.reject("null event handler");
		}
    }
}