class RouteActionsHandler {
    private _domain: Domain;
    private _routeActions: any = {};


    constructor(domain: Domain, events: any) {
        this._domain = domain;
        this.makeActions(events);
    }

    inform(event: string, request: any, reponse: any): Promise<void> {        
        return new Promise<void>((resolve, reject) => {
            let routeActions: RouteAction[] = this._routeActions[event];

            this.performRouteActions(0, routeActions, request, reponse).then(() => {
                resolve();
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    performRouteActions(index: number, routeActions: RouteAction[], request: any, reponse: any) {
        return new Promise<void>((resolve, reject) => {
            if(!routeActions) {
                return resolve();
            }

            if(index >= routeActions.length) {
                return resolve();
            }
      
            routeActions[index].do(this._domain, request, reponse).then(() => {
                index++;
                
                return this.performRouteActions(index, routeActions, request, reponse);
            }).then(() => {
                return resolve();
            }).catch((error: any) => {
                return reject(error);
            });
        });
    }

    makeActions(events: any) {
        for(let event in events) {
            this._routeActions[event] = [];

            this._routeActions[event] = this.makeRouteActions(events[event]);
        }
    }

    makeRouteActions(routeActions: any[]) {
        let actions = [];
        
        for(let i=0; i<routeActions.length; i++) {
            actions.push(this.makeRouteAction(routeActions[i]));
        }

        return actions;
    }

    makeRouteAction(routeAction: any) {
        let actionType = Object.keys(routeAction)[0];

        if(actionType == "model") {
            return new ModelAction(this._domain, routeAction[actionType]);
        }
        else if(actionType == "service") {
            return new ServiceAction(this._domain, routeAction[actionType]);
        }

        return new NullAction(this._domain, actionType);
    }
}