class DataService implements Service {
    onRequest(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {
        console.log("data service handle!");

        return Promise.resolve();
    }

    onResponse(request: any, response: any, modelMap: ModelMap, parameters: any): Promise<unknown> {
        console.log("data service reply!");

        return Promise.resolve();
    }
}