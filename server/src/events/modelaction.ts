/// <reference path="routeaction.ts"/>

class ModelAction extends RouteAction {

    handle(domain: Domain, routeActionsHandler: RouteActionsHandler, request: any, response: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let modelMap: ModelMap = request.singlefin.modelMap;
            
            let instance = modelMap.getParentInstance(this.parameters);
            let method = modelMap.getValue(this.parameters);
    
            method.call(instance, domain, request, response).then(() => {
                resolve();
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
}