class RouteFile {
    constructor(router: any, options: any) {
    }

    call(request: any, response: any, options: any, data: any) {
        return new Promise((resolve, reject) => {
            resolve(options);
        });
    }
}
