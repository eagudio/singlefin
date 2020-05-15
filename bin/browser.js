"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var BrowserModule;
(function (BrowserModule) {
    class Browser {
        constructor() {
            this._home = "__body";
            this._body = "__body";
            this._instances = [];
            this._styles = [];
            this._pages = {
                __body: {
                    container: "__body",
                    view: {
                        render: (parameters) => {
                            return new Promise((resolve, reject) => {
                                resolve($("body"));
                            });
                        }
                    },
                    controllers: [],
                    models: {},
                    events: [],
                    htmlElement: $("body")
                }
            };
            this._surrogates = {};
            this._handlers = {};
            this._defaultLanguage = "it-IT";
            this._resources = {
                "it-IT": {}
            };
        }
        init(config, onInit) {
            try {
                var params = this.getUrlParams(window.location.href);
                var configLoader = new BrowserModule.ConfigLoader();
                configLoader.load(config, this);
                this.loadInstances().then(() => {
                    var _homepage = config.homepage;
                    if (params) {
                        if (params.page) {
                            this._home = params.page;
                            _homepage = this._home;
                        }
                    }
                    this.open(_homepage).then(() => {
                        onInit();
                    });
                }, () => {
                });
            }
            catch (ex) {
                console.error("an error occurred during init browser");
            }
        }
        open(pageName, parameters) {
            return new Promise((resolve) => {
                var _pageName = this._body + "/" + pageName;
                var browserHandler = new BrowserModule.BrowserHandler(this);
                browserHandler.draw(_pageName, parameters).then(() => {
                    resolve(this._pages[_pageName]);
                }, (error) => {
                    console.error("an error occurred during open page '" + pageName + "'");
                    resolve();
                });
            });
        }
        refresh(pageName, parameters) {
            return new Promise((resolve) => {
                var _pageName = this._body + "/" + pageName;
                var browserHandler = new BrowserModule.BrowserHandler(this);
                browserHandler.redraw(_pageName, parameters).then(() => {
                    resolve(this.pages[_pageName]);
                }, (error) => {
                    console.error("an error occurred during refresh page '" + pageName + "'");
                    resolve();
                });
            });
        }
        close(pageName) {
            return new Promise((resolve) => {
                var _pageName = this._body + "/" + pageName;
                var page = this.pages[_pageName];
                if (!page) {
                    page = this._surrogates[_pageName];
                    if (!page) {
                        console.error("an error occured during close page: page '" + pageName + "' not found");
                        return resolve();
                    }
                }
                var browserHandler = new BrowserModule.BrowserHandler(this);
                browserHandler.close(page).then(() => {
                    resolve();
                }, (error) => {
                    console.error("an error occurred during close page '" + pageName + "'");
                    resolve();
                });
            });
        }
        trigger(event, data) {
            var paths = [];
            if (this._handlers[event]) {
                paths = this._handlers[event];
            }
            for (var h = 0; h < paths.length; h++) {
                var handlerPage = this.pages[paths[h]];
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
        get instances() {
            return this._instances;
        }
        set resources(_resources) {
            this._resources = _resources;
        }
        get resources() {
            return this._resources;
        }
        get defaultResources() {
            return this._resources[this._defaultLanguage];
        }
        set styles(_styles) {
            this._styles = _styles;
        }
        get styles() {
            return this._styles;
        }
        get body() {
            return this._body;
        }
        get pages() {
            return this._pages;
        }
        get surrogates() {
            return this._surrogates;
        }
        get handlers() {
            return this._handlers;
        }
        addPage(action, pageName, pagePath, container, view, htmlview, controllers, models, replace, append, unwind, key, events, parameters) {
            if (typeof view != "string") {
                throw "view must be a string";
            }
            if (htmlview) {
                //TODO: vedi https://github.com/requirejs/text per il plugin text...
                this._instances.push("text!" + htmlview);
            }
            this._instances.push(view);
            if (controllers) {
                for (var i = 0; i < controllers.length; i++) {
                    this._instances.push(controllers[i]);
                }
                ;
            }
            if (models) {
                for (var modelKey in models) {
                    this._instances.push(models[modelKey]);
                }
            }
            this._pages[pagePath] = {
                name: pageName,
                action: action,
                container: container,
                view: view,
                htmlview: htmlview ? "text!" + htmlview : undefined,
                controllers: controllers,
                models: models,
                replace: replace,
                append: append,
                unwind: unwind,
                key: key,
                events: events,
                parameters: parameters
            };
        }
        loadInstances() {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                var loader = new BrowserModule.Loader();
                loader.load(this._instances).then(() => {
                    try {
                        for (var i = 0; i < this._styles.length; i++) {
                            $('head').append(`<link rel="stylesheet" href="` + this._styles[i] + `.css" type="text/css" />`);
                        }
                        for (var key in this._resources) {
                            this._resources[key] = loader.getInstance(this._resources[key]);
                        }
                        for (var key in this._pages) {
                            if (typeof this._pages[key].view == "string") {
                                this._pages[key].view = loader.getInstance(this._pages[key].view);
                            }
                            if (typeof this._pages[key].htmlview == "string") {
                                this._pages[key].htmlview = loader.getInstance(this._pages[key].htmlview);
                            }
                            var controllers = [];
                            if (this._pages[key].controllers && Array.isArray(this._pages[key].controllers)) {
                                controllers = this._pages[key].controllers.map((controller) => {
                                    return loader.getInstance(controller);
                                });
                            }
                            this._pages[key].controllers = controllers;
                            var models = null;
                            if (this._pages[key].models) {
                                models = {};
                                for (var modelKey in this._pages[key].models) {
                                    models[modelKey] = loader.getInstance(this._pages[key].models[modelKey]);
                                }
                            }
                            this._pages[key].models = models;
                        }
                        resolve();
                    }
                    catch (ex) {
                        console.error("load instances error");
                        reject(ex);
                    }
                }, (error) => {
                    console.error("load instances error");
                    reject(error);
                });
            }));
        }
        getUrlParams(url) {
            var queryString = url.split("?");
            var query = "";
            if (queryString.length < 2) {
                return null;
            }
            query = queryString[1];
            var vars = query.split("&");
            var queryObject = {};
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                var key = decodeURIComponent(pair[0]);
                var value = decodeURIComponent(pair[1]);
                if (typeof queryObject[key] === "undefined") {
                    queryObject[key] = decodeURIComponent(value);
                }
                else if (typeof queryObject[key] === "string") {
                    var arr = [queryObject[key], decodeURIComponent(value)];
                    queryObject[key] = arr;
                }
                else {
                    queryObject[key].push(decodeURIComponent(value));
                }
            }
            return queryObject;
        }
    }
    BrowserModule.Browser = Browser;
})(BrowserModule || (BrowserModule = {}));
window.browser = window.browser || new BrowserModule.Browser();
window.$b = window.$b || window.browser || new BrowserModule.Browser();
var BrowserModule;
(function (BrowserModule) {
    class BrowserHandler {
        constructor(_browser) {
            this._browser = _browser;
        }
        draw(pageName, parameters) {
            return new Promise((resolve, reject) => {
                this.drawBody(parameters).then(() => {
                    if (pageName == this._browser.body) {
                        return resolve(this._browser.pages.__body.htmlElement);
                    }
                    var page = this._browser.pages[pageName];
                    if (!page) {
                        console.error("page not found");
                        return reject("page not found");
                    }
                    this.drawContainer(page, page.container, parameters).then((htmlContainerElement) => {
                        this.loadController(page, parameters).then((viewParameters) => {
                            if (!page.view.render) {
                                console.error("an error occurred during render view: page method render missing");
                                return reject("an error occurred during render view: page method render missing");
                            }
                            page.htmlElement = page.view.render(viewParameters, this._browser.defaultResources);
                            this.addEventsHandlers(page, page.htmlElement, viewParameters);
                            this.drawItems(page, viewParameters).then(() => {
                                this.addHtmlElement(htmlContainerElement, page);
                                resolve(page.htmlElement);
                            }, (ex) => {
                                if (ex) {
                                    console.error("draw error");
                                    reject("draw error");
                                }
                                else {
                                    resolve($(``));
                                }
                            });
                        }, (ex) => {
                            if (ex) {
                                console.error("draw error");
                                reject("draw error");
                            }
                            else {
                                resolve($(``));
                            }
                        });
                    }, (ex) => {
                        if (ex) {
                            console.error("draw error");
                            reject("draw error");
                        }
                        else {
                            resolve($(``));
                        }
                    });
                }, (ex) => {
                    if (ex) {
                        console.error("draw error: " + ex);
                        reject("draw error: " + ex);
                    }
                    else {
                        resolve($(``));
                    }
                });
            });
        }
        redraw(pageName, parameters) {
            return new Promise((resolve, reject) => {
                if (pageName == this._browser.body) {
                    return resolve(this._browser.pages.__body.htmlElement);
                }
                var page = this._browser.pages[pageName];
                if (!page) {
                    console.error("page not found");
                    return reject("page not found");
                }
                this.drawContainer(page, page.container, parameters).then((htmlContainerElement) => {
                    this.reloadController(page, parameters).then((viewParameters) => {
                        if (!page.view.render) {
                            console.error("an error occurred during render view: page method render missing");
                            return reject("an error occurred during render view: page method render missing");
                        }
                        var previousPageHtmlElement = page.htmlElement;
                        page.htmlElement = page.view.render(viewParameters, this._browser.defaultResources);
                        this.addEventsHandlers(page, page.htmlElement, viewParameters);
                        this.drawItems(page, viewParameters).then(() => {
                            previousPageHtmlElement.replaceWith(page.htmlElement);
                            resolve(page.htmlElement);
                        }, (ex) => {
                            if (ex) {
                                console.error("redraw error");
                                reject("redraw error");
                            }
                            else {
                                resolve($(``));
                            }
                        });
                    }, (ex) => {
                        if (ex) {
                            console.error("redraw error");
                            reject("redraw error");
                        }
                        else {
                            resolve($(``));
                        }
                    });
                }, (ex) => {
                    if (ex) {
                        console.error("redraw error");
                        reject("redraw error");
                    }
                    else {
                        resolve($(``));
                    }
                });
            });
        }
        drawBody(parameters) {
            var body = this._browser.pages[this._browser.body];
            if (body.htmlElement) {
                return Promise.resolve(body.htmlElement);
            }
            return new Promise((resolve, reject) => {
                this.loadController(body, parameters).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                    if (!body.view.render) {
                        console.error("an error occurred during render view: page method render missing");
                        return reject("an error occurred during render view: page method render missing");
                    }
                    body.htmlElement = body.view.render(viewParameters, this._browser.defaultResources);
                    resolve(body.htmlElement);
                }), (ex) => {
                    if (ex) {
                        console.error("draw body error");
                        reject("draw body error");
                    }
                    else {
                        resolve($(``));
                    }
                });
            });
        }
        drawContainer(page, containerName, parameters) {
            var container = this._browser.pages[containerName];
            if (!container) {
                console.error("container page '" + containerName + "' not found");
                return Promise.reject("container page '" + containerName + "' not found");
            }
            if (!container.htmlElement) {
                return this.drawParent(page, containerName, parameters);
            }
            return Promise.resolve(container.htmlElement);
        }
        drawItems(parentPage, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this.drawChildren(parentPage, parentPage.replace, parameters).then(() => {
                    this.drawChildren(parentPage, parentPage.append, parameters).then(() => {
                        this.drawChildren(parentPage, parentPage.unwind, parameters).then(() => {
                            resolve();
                        }, (ex) => {
                            if (ex) {
                                console.error("draw items error");
                                reject("draw items error");
                            }
                            else {
                                resolve();
                            }
                        });
                    }, (ex) => {
                        if (ex) {
                            console.error("draw items error");
                            reject("draw items error");
                        }
                        else {
                            resolve();
                        }
                    });
                }, (ex) => {
                    if (ex) {
                        console.error("draw items error");
                        reject("draw items error");
                    }
                    else {
                        resolve();
                    }
                });
            }));
        }
        drawParent(page, pageName, parameters) {
            return new Promise((resolve, reject) => {
                if (pageName == this._browser.body) {
                    return resolve(this._browser.pages.__body.htmlElement);
                }
                var parentPage = this._browser.pages[pageName];
                if (!parentPage) {
                    console.error("page not found");
                    return reject("page not found");
                }
                this.drawContainer(page, parentPage.container, parameters).then((htmlContainerElement) => {
                    if (!page.models) {
                        page.models = parentPage.models;
                    }
                    this.loadController(parentPage, parameters).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                        if (!parentPage.view.render) {
                            console.error("an error occurred during render view: page method render missing");
                            return reject("an error occurred during render view: page method render missing");
                        }
                        parentPage.htmlElement = parentPage.view.render(viewParameters, this._browser.defaultResources);
                        this.addEventsHandlers(parentPage, htmlContainerElement, viewParameters);
                        this.addHtmlElement(htmlContainerElement, parentPage);
                        resolve(parentPage.htmlElement);
                    }), (ex) => {
                        if (ex) {
                            console.error("draw parent error");
                            reject("draw parent error");
                        }
                        else {
                            resolve($(``));
                        }
                    });
                });
            });
        }
        drawChildren(parent, children, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!children) {
                    return resolve();
                }
                for (var i = 0; i < children.length; i++) {
                    var childPageName = children[i];
                    var childPage = this._browser.pages[childPageName];
                    if (!childPage.models) {
                        childPage.models = parent.models;
                    }
                    yield this.loadController(childPage, parameters).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                        if (!childPage.view.render) {
                            console.error("draw children error: page method render missing");
                            return reject("draw children error: page method render missing");
                        }
                        if (childPage.action == "unwind") {
                            yield this.unwind(parent, childPageName, childPage, viewParameters).then(() => __awaiter(this, void 0, void 0, function* () {
                            }), (ex) => {
                                if (ex) {
                                    console.error("draw children error");
                                    return reject("draw children error");
                                }
                            });
                        }
                        else {
                            childPage.htmlElement = childPage.view.render(viewParameters, this._browser.defaultResources);
                            this.addEventsHandlers(childPage, childPage.htmlElement, viewParameters);
                            this.addHtmlElement(parent.htmlElement, childPage);
                            yield this.drawItems(childPage, viewParameters).then(() => __awaiter(this, void 0, void 0, function* () {
                            }), (ex) => {
                                if (ex) {
                                    console.error("draw children error");
                                    return reject("draw children error");
                                }
                            });
                        }
                    }), (ex) => {
                        if (ex) {
                            console.error("draw children error");
                            return reject("draw children error");
                        }
                    });
                }
                resolve();
            }));
        }
        unwind(parent, pageName, page, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!Array.isArray(parameters)) {
                    console.error("unwind error page '" + pageName + "': controller must return an array");
                    return reject("unwind error page '" + pageName + "': controller must return an array");
                }
                //TODO: rimuovere i surrogati per liberare memoria e gli eventi!?
                for (var i = 0; i < parameters.length; i++) {
                    var surrogate = this.addSurrogate(pageName + "/" + page.name + "#" + i, page.name + "#" + i, page);
                    yield this.resolveUnwindItem(surrogate, parameters[i]).then((viewParameter) => __awaiter(this, void 0, void 0, function* () {
                        surrogate.htmlElement = page.view.render(viewParameter, this._browser.defaultResources);
                        this.addEventsHandlers(surrogate, surrogate.htmlElement, viewParameter);
                        yield this.drawItems(surrogate, viewParameter).then(() => __awaiter(this, void 0, void 0, function* () {
                            this.addHtmlElement(parent.htmlElement, surrogate);
                        }), (ex) => {
                            if (ex) {
                                console.error("unwind error");
                                return reject("unwind error");
                            }
                        });
                    }), (ex) => {
                        if (ex) {
                            console.error("unwind error");
                            return reject("unwind error");
                        }
                    });
                }
                resolve();
            }));
        }
        addSurrogate(path, name, page) {
            var surrogate = {
                name: name,
                action: page.action,
                container: page.container,
                view: page.view,
                controllers: page.controllers,
                models: page.models,
                parameters: page.parameters,
                key: page.key,
                events: page.events,
                htmlElement: null,
                replace: this.createSurrogates(path, page.replace),
                append: this.createSurrogates(path, page.append),
                unwind: this.createSurrogates(path, page.unwind)
            };
            this._browser.pages[path] = surrogate;
            return surrogate;
        }
        createSurrogates(path, pagesPath) {
            var surrogates = [];
            for (var i = 0; i < pagesPath.length; i++) {
                var page = this._browser.pages[pagesPath[i]];
                surrogates.push(path + "/" + page.name);
                this.addSurrogate(path + "/" + page.name, page.name, page);
            }
            return surrogates;
        }
        removeSurrogates(prefixPagePath) {
            for (var key in this._browser.surrogates) {
                if (key.startsWith(prefixPagePath)) {
                    delete this._browser.surrogates[key];
                }
            }
        }
        loadController(page, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!page.controllers) {
                    return resolve(parameters);
                }
                var result = parameters;
                for (var i = 0; i < page.controllers.length; i++) {
                    yield page.controllers[i].load(page, result).then((_result) => __awaiter(this, void 0, void 0, function* () {
                        result = _result;
                    }), (ex) => {
                        if (ex) {
                            console.error("load controller error: " + ex);
                        }
                        reject(ex);
                    });
                }
                resolve(result);
            }));
        }
        reloadController(page, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!page.controllers) {
                    return resolve(parameters);
                }
                var result = parameters;
                for (var i = 0; i < page.controllers.length; i++) {
                    if (page.controllers[i].reload) {
                        yield page.controllers[i].reload(page, result).then((_result) => __awaiter(this, void 0, void 0, function* () {
                            result = _result;
                        }), (ex) => {
                            console.error("reload controller error: " + ex);
                            reject("reload controller error: " + ex);
                        });
                    }
                }
                resolve(result);
            }));
        }
        resolveUnwindItem(page, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!page.controllers) {
                    return resolve(parameters);
                }
                var result = parameters;
                for (var i = 0; i < page.controllers.length; i++) {
                    if (page.controllers[i].unwind) {
                        yield page.controllers[i].unwind(page, result).then((_result) => __awaiter(this, void 0, void 0, function* () {
                            result = _result;
                        }), (ex) => {
                            console.error("resolve unwind item error: " + ex);
                            reject("resolve unwind item error: " + ex);
                        });
                    }
                }
                resolve(result);
            }));
        }
        addHtmlElement(container, page) {
            var pageName = page.name.split('#')[0];
            var browserTag = container.find("browser[" + pageName + "]");
            if (browserTag.length > 0) {
                browserTag.parent().append(page.htmlElement);
                return;
            }
            if (page.action == "replace") {
                container.html(page.htmlElement);
            }
            else if (page.action == "append") {
                container.append(page.htmlElement);
            }
            else if (page.action == "unwind") {
                container.append(page.htmlElement);
            }
        }
        addEventsHandlers(page, element, parameters) {
            if (!element) {
                return;
            }
            element.each((i, item) => {
                $.each(item.attributes, (i, attribute) => {
                    if (attribute.specified) {
                        if (attribute.name.startsWith("browser-")) {
                            var browserAttribute = attribute.name.split("browser-");
                            var event = browserAttribute[1];
                            var handlerList = [];
                            if (attribute.value) {
                                handlerList = attribute.value.split(",");
                            }
                            for (var n = 0; n < handlerList.length; n++) {
                                var handler = handlerList[n];
                                var paths = [];
                                if (this._browser.handlers[handler]) {
                                    paths = this._browser.handlers[handler];
                                }
                                for (var p = 0; p < paths.length; p++) {
                                    var handlerPage = this._browser.pages[paths[p]];
                                    if (handlerPage.view[handler]) {
                                        this.addEventHandler(handlerPage, page, paths[p], element, event, handlerPage.view[handler], parameters);
                                    }
                                    for (var c = 0; c < handlerPage.controllers.length; c++) {
                                        if (handlerPage.controllers[c][handler]) {
                                            this.addEventHandler(handlerPage, page, paths[p], element, event, handlerPage.controllers[c][handler], parameters);
                                        }
                                    }
                                }
                            }
                        }
                        if (attribute.name == "href") {
                            if (attribute.value.startsWith("browser#")) {
                                var href = attribute.value;
                                var markup = href.split("#");
                                if (markup.length > 0) {
                                    var path = markup[1];
                                    element.on("click", (event) => {
                                        event.preventDefault();
                                        this._browser.open(path);
                                        return false;
                                    });
                                }
                            }
                        }
                    }
                });
            });
            var children = element.children();
            children.each((i, item) => {
                this.addEventsHandlers(page, $(item), parameters);
            });
        }
        addEventHandler(handlerPage, page, path, htmlElement, event, handler, data) {
            htmlElement.on(event, {
                event: event,
                handler: handler,
                data: data,
                path: path,
                page: page,
                target: handlerPage,
                htmlElement: htmlElement
            }, (event) => {
                var browserEventObject = event.data;
                //TODO: workaround: per gli elementi surrogati di unwind non si ha sempre disponibile l'htmlElement perchè in realtà viene passato l'oggetto originale (non il surrogato)
                browserEventObject.target = browserEventObject.target.htmlElement ? browserEventObject.target.htmlElement : browserEventObject.htmlElement;
                event.browser = browserEventObject;
                event.data = null;
                browserEventObject.handler(event);
            });
        }
        close(page) {
            return new Promise((resolve, reject) => {
                this.closeItems(page).then(() => {
                    this.closeController(page).then(() => {
                        this.closeView(page);
                        resolve();
                    }, (ex) => {
                        console.error("close error");
                        reject("close error");
                    });
                }, (ex) => {
                    console.error("close error");
                    reject("close error");
                });
            });
        }
        closeView(page) {
            if (page.view.close) {
                page.view.close(page.htmlElement);
            }
        }
        closeController(page) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!page.controllers) {
                    return resolve();
                }
                for (var i = 0; i < page.controllers.length; i++) {
                    if (page.controllers[i].close) {
                        yield page.controllers[i].close().then(() => {
                        }, (ex) => {
                            console.error("close controller error: " + ex);
                            return reject("close controller error" + ex);
                        });
                    }
                }
                return resolve();
            }));
        }
        closeItems(page) {
            return new Promise((resolve, reject) => {
                this.closeChildren(page.replace).then(() => {
                    this.closeChildren(page.append).then(() => {
                        this.closeChildren(page.unwind).then(() => {
                            resolve();
                        }, (ex) => {
                            if (ex) {
                                console.error("close itmes error");
                                reject("close itmes error");
                            }
                            else {
                                resolve();
                            }
                        });
                    }, (ex) => {
                        if (ex) {
                            console.error("close itmes error");
                            reject("close itmes error");
                        }
                        else {
                            resolve();
                        }
                    });
                }, (ex) => {
                    if (ex) {
                        console.error("close itmes error");
                        reject("close itmes error");
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        closeChildren(children) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!children) {
                    return resolve();
                }
                for (var i = 0; i < children.length; i++) {
                    var childName = children[i];
                    var page = this._browser.pages[childName];
                    if (!page) {
                        page = this._browser.surrogates[childName];
                        if (!page) {
                            console.error("close children error: page '" + childName + "' not found");
                            return resolve();
                        }
                    }
                    yield this.closeItems(page).then(() => __awaiter(this, void 0, void 0, function* () {
                        this.closeController(page).then(() => {
                            this.closeView(page);
                        }, (ex) => {
                            console.error("close children error");
                        });
                    }), (ex) => {
                        console.error("close children error");
                    });
                }
                resolve();
            }));
        }
    }
    BrowserModule.BrowserHandler = BrowserHandler;
})(BrowserModule || (BrowserModule = {}));
var BrowserModule;
(function (BrowserModule) {
    class ConfigLoader {
        load(config, browser) {
            var resources = config.resources;
            var styles = config.styles;
            var schema = config.schema;
            if (!schema) {
                throw "schema cannot be null or undefined";
            }
            if (!schema.body) {
                throw "schema body missing";
            }
            this.processResources(resources, browser);
            browser.styles = styles;
            var body = schema.body;
            if (body.view) {
                browser.pages.__body.htmlElement = null;
                browser.pages.__body.view = body.view;
                browser.instances.push(body.view);
            }
            if (body.controllers && Array.isArray(body.controllers)) {
                browser.pages.__body.controllers = body.controllers;
                for (var i = 0; i < body.controllers.length; i++) {
                    browser.instances.push(body.controllers[i]);
                }
            }
            if (body.models) {
                browser.pages.__body.models = body.models;
                for (var modelKey in body.models) {
                    browser.instances.push(body.models[modelKey]);
                }
            }
            browser.pages.__body.events = body.events;
            this.addHandlers(browser.body, browser);
            this.processSchema("append", browser.body, body.append, browser);
            this.processSchema("replace", browser.body, body.replace, browser);
            this.processSchema("unwind", browser.body, body.unwind, browser);
        }
        processResources(resources, browser) {
            browser.resources = resources;
            for (var key in resources) {
                browser.instances.push(resources[key]);
            }
        }
        addHandlers(pagePath, browser) {
            var _page = browser.pages[pagePath];
            if (_page.events) {
                for (var h = 0; h < _page.events.length; h++) {
                    if (!browser.handlers[_page.events[h]]) {
                        browser.handlers[_page.events[h]] = [];
                    }
                    browser.handlers[_page.events[h]].push(pagePath);
                }
            }
        }
        processSchema(action, containerName, schema, browser) {
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
                var replaceChildren = this.processChildrenSchema(pagePath, page.replace);
                var appendChildren = this.processChildrenSchema(pagePath, page.append);
                var unwindChildren = this.processChildrenSchema(pagePath, page.unwind);
                browser.addPage(action, pageName, pagePath, containerName, page.view, page.htmlview, page.controllers, page.models, replaceChildren, appendChildren, unwindChildren, page.key, page.events, page.parameters);
                this.processSchema("replace", pagePath, page.replace, browser);
                this.processSchema("append", pagePath, page.append, browser);
                this.processSchema("unwind", pagePath, page.unwind, browser);
                this.addHandlers(pagePath, browser);
            }
        }
        processChildrenSchema(parentPagePath, childrenSchema) {
            var children = [];
            if (!childrenSchema) {
                return children;
            }
            for (var i = 0; i < childrenSchema.length; i++) {
                var childPagePath = parentPagePath + "/" + Object.keys(childrenSchema[i])[0];
                children.push(childPagePath);
            }
            return children;
        }
    }
    BrowserModule.ConfigLoader = ConfigLoader;
})(BrowserModule || (BrowserModule = {}));
var BrowserModule;
(function (BrowserModule) {
    class Loader {
        load(paths) {
            return new Promise((resolve, reject) => {
                require(paths, function () {
                    resolve();
                }, function (error) {
                    reject(error);
                });
            });
        }
        getInstance(path) {
            return require(path);
        }
    }
    BrowserModule.Loader = Loader;
})(BrowserModule || (BrowserModule = {}));
//# sourceMappingURL=browser.js.map