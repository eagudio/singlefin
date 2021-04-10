/// <reference path="routeaction.ts"/>

class ServiceAction extends RouteAction {

    handle(domain: Domain, routeActionsHandler: RouteActionsHandler, request: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let services = domain.services;

            let service: Service = services[this.parameters.service];
    
            service.call(routeActionsHandler, request.singlefin.modelMap, this.parameters, request).then(() => {
                resolve();
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
}