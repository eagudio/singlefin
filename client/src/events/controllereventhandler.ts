/// <reference path="eventhandler.ts"/>

module SinglefinModule {
    export class ControllerEventHandler extends EventHandler {
        handle(singlefin: Singlefin, delegate: any, page: Page, parameters: any, pageModels: any, event?: any): Promise<void> {
			return new Promise(async (resolve, reject) => {
				let result = parameters;
	
				for(let i=0; i<page.controllers.length; i++) {
					let controller = page.controllers[i];
					let controllerMethod = controller[delegate.controller];
	
					if(controllerMethod) {
						let promise = controllerMethod.call(controller, page.app, page, singlefin.models, parameters, event);

						if(promise) {
							await promise.then((_result: any) => {
								result = _result;
							}, (ex: any) => {
								console.error("page '" + page.name +  "' handle controller error: " + ex);
								
								return reject(ex);
							});
						}
					}
				}
	
				resolve(result);
			});
		}
    }
}