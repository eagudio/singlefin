"use strict";
var Browser;
(function (Browser_1) {
    class Browser {
        init(resources, styles, schema, homepage, onInit) {
            var params = browser._private.getUrlParams(window.location.href);
            browser._private.loadStyles(styles);
            browser._private.loadResources(resources);
            browser._private.loadSchema(schema).then(() => {
                var _homepage = homepage;
                if (params) {
                    if (params.page) {
                        browser._private._home = params.page;
                        _homepage = browser._private._home;
                    }
                }
                browser.open(_homepage).then(() => {
                    onInit();
                });
            });
        }
        page(pageName) {
            return browser._private._pages[pageName];
        }
        open(pageName, parameters) {
            return new Promise((resolve) => {
                var _pageName = browser._private._body + "/" + pageName;
                browser._private.draw(_pageName, parameters).then(() => {
                    resolve(browser._private._pages[_pageName]);
                }, (error) => {
                    console.error("an error occurred during open page '" + pageName + "': " + error);
                    resolve();
                });
            });
        }
        refresh(pageName, parameters) {
            return new Promise((resolve) => {
                var _pageName = browser._private._body + "/" + pageName;
                browser._private.redraw(_pageName, parameters).then(() => {
                    resolve(browser._private._pages[_pageName]);
                }, (error) => {
                    console.error("an error occurred during refresh page '" + pageName + "': " + error);
                    resolve();
                });
            });
        }
        close(pageName) {
            return new Promise((resolve) => {
                var _pageName = browser._private._body + "/" + pageName;
                var page = browser._private._pages[_pageName];
                if (!page) {
                    page = browser._private._surrogates[_pageName];
                    if (!page) {
                        console.error("an error occured during close page: page '" + pageName + "' not found");
                        return resolve();
                    }
                }
                browser._private.close(page).then(() => {
                    resolve();
                }, (error) => {
                    console.error("an error occurred during close page '" + pageName + "': " + error);
                    resolve();
                });
            });
        }
        trigger(event, data) {
            var paths = [];
            if (browser._private._handlers[event]) {
                paths = browser._private._handlers[event];
            }
            for (var h = 0; h < paths.length; h++) {
                var handlerPage = browser._private._pages[paths[h]];
                var eventObject = {
                    browser: {
                        event: "event",
                        handler: event,
                        data: data,
                        path: paths[h],
                        page: handlerPage
                    }
                };
                if (handlerPage.view[event]) {
                    handlerPage.view[event](eventObject);
                }
                if (handlerPage.controller && handlerPage.controller[event]) {
                    handlerPage.controller[event](eventObject);
                }
            }
        }
        getURLPath() {
            var path = window.location.href;
            var paths = path.split("/");
            if (paths.length > 2) {
                var basePath = "/";
                for (var i = 3; i < paths.length; i++) {
                    var qualifyPaths = paths[i].split("?");
                    basePath += qualifyPaths[0];
                }
                return basePath;
            }
            return "/";
        }
    }
    Browser_1.Browser = Browser;
})(Browser || (Browser = {}));
window.browser = window.browser || new Browser.Browser();
window.$b = window.$b || window.browser || new Browser.Browser();
var Browser;
(function (Browser) {
    class HelloWorld {
        /**
         * test
         */
        test() {
            let message = 'Hello World';
            console.log(message);
        }
    }
    Browser.HelloWorld = HelloWorld;
})(Browser || (Browser = {}));
var Browser;
(function (Browser) {
    class Schema {
        load(schema) {
            if (!schema) {
                return Promise.reject("schema cannot be null or undefined");
            }
            if (!schema.body) {
                return Promise.reject("schema body missing");
            }
            var _pages;
            return new Promise((resolve, reject) => {
                resolve($("body"));
            });
        }
    }
    Browser.Schema = Schema;
    controllers: [],
        models;
    { }
    events: [],
        htmlElement;
    $("body");
})(Browser || (Browser = {}));
var body = schema.body;
if (body.view) {
    browser._private._pages.__body.htmlElement = null;
    browser._private._pages.__body.view = body.view;
    browser._private._instances.push(body.view);
}
if (body.controllers && Array.isArray(body.controllers)) {
    browser._private._pages.__body.controllers = body.controllers;
    for (var i = 0; i < body.controllers.length; i++) {
        browser._private._instances.push(body.controllers[i]);
    }
}
if (body.models) {
    browser._private._pages.__body.models = body.models;
    for (var modelKey in body.models) {
        browser._private._instances.push(body.models[modelKey]);
    }
}
browser._private._pages.__body.events = body.events;
browser._private.addHandlers(browser._private._body);
browser._private.processSchema("append", browser._private._body, body.append);
browser._private.processSchema("replace", browser._private._body, body.replace);
browser._private.processSchema("unwind", browser._private._body, body.unwind);
return browser._private.loadInstances();
processSchema: (action, containerName, schema) => {
    if (!action) {
        return;
    }
    if (!containerName) {
        throw "container missed";
    }
    if (schema == null) {
        return;
    }
    for (var i = 0; i < schema.length; i++) {
        var pageName = Object.keys(schema[i])[0];
        var pagePath = containerName + "/" + pageName;
        var page = schema[i][pageName];
        var replaceChildren = browser._private.processChildrenSchema(pagePath, page.replace);
        var appendChildren = browser._private.processChildrenSchema(pagePath, page.append);
        var unwindChildren = browser._private.processChildrenSchema(pagePath, page.unwind);
        browser._private.addPage(action, pageName, pagePath, containerName, page.view, page.htmlview, page.controllers, page.models, replaceChildren, appendChildren, unwindChildren, page.key, page.events, page.parameters);
        browser._private.processSchema("replace", pagePath, page.replace);
        browser._private.processSchema("append", pagePath, page.append);
        browser._private.processSchema("unwind", pagePath, page.unwind);
        browser._private.addHandlers(pagePath);
    }
};
processChildrenSchema: (parentPagePath, childrenSchema) => {
    var children = [];
    if (!childrenSchema) {
        return children;
    }
    for (var i = 0; i < childrenSchema.length; i++) {
        var childPagePath = parentPagePath + "/" + Object.keys(childrenSchema[i])[0];
        children.push(childPagePath);
    }
    return children;
};
addHandlers: (pagePath) => {
    var _page = browser._private._pages[pagePath];
    if (_page.events) {
        for (var h = 0; h < _page.events.length; h++) {
            if (!browser._private._handlers[_page.events[h]]) {
                browser._private._handlers[_page.events[h]] = [];
            }
            browser._private._handlers[_page.events[h]].push(pagePath);
        }
    }
};
//# sourceMappingURL=browser.js.map