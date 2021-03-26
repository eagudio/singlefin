/// <reference path="eventhandler.ts"/>

module SinglefinModule {
    export class ControllerEventHandler extends EventHandler {
        handle(singlefin: Singlefin, delegate: any, page: Page, parameters: any, pageModels: any, event?: any): Promise<void> {
			return new Promise(async (resolve, reject) => {
				var result = parameters;
	
				for(var i=0; i<page.controllers.length; i++) {
					var controller = page.controllers[i];
					var controllerMethod = controller[delegate.controller];
	
					if(controllerMethod) {
						var promise = controllerMethod.call(controller, page.app, page, singlefin.models, parameters, event);

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