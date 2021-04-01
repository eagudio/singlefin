/// <reference path="routeaction.ts"/>

class ModelAction extends RouteAction {

    handle(domain: Domain, routeActionsHandler: RouteActionsHandler, request: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            var modelMap: ModelMap = request.singlefin.modelMap;
            
            var instance = modelMap.getParentInstance(this.parameters);
            var method = modelMap.getValue(this.parameters);
    
            method.call(instance, domain, request).then(() => {
                resolve();
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
}