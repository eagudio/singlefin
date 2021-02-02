class DataService {
    onRequest(request: any, response: any, models: any, config: any): Promise<unknown> {
        console.log("data service handle!");

        return Promise.resolve();
    }

    onResponse(request: any, response: any, models: any, config: any): Promise<unknown> {
        console.log("data service reply!");

        return Promise.resolve();
    }
}