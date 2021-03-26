module SinglefinModule {
    export abstract class EventHandler {
        protected eventManager: EventManager;
        
        
        constructor(eventManager: EventManager) {
            this.eventManager = eventManager;
        }

        abstract handle(singlefin: Singlefin, delegate: any, page: Page, parameters: any, pageModels: any, eventObject: any): Promise<void>;
    }
}