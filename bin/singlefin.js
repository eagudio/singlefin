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
var SinglefinModule;
(function (SinglefinModule) {
    class App {
        constructor(_singlefin) {
            this._rootPath = "";
            this._singlefin = _singlefin;
        }
        get rootPath() {
            return this._rootPath;
        }
        set rootPath(value) {
            this._rootPath = value;
        }
        get models() {
            return this._singlefin.models;
        }
        open(pageName, parameters, models) {
            return this._singlefin.open(this._rootPath + pageName, parameters, models);
        }
        refresh(pageName, parameters, models) {
            return this._singlefin.refresh(this._rootPath + pageName, parameters, models);
        }
        close(pageName, parameters) {
            return this._singlefin.close(this._rootPath + pageName, parameters);
        }
        openGroupPageByIndex(pageName, index, parameters, models) {
            return this._singlefin.openGroupPageByIndex(this._rootPath + pageName, index, parameters, models);
        }
        openGroupPage(pageName, page, parameters, models) {
            return this._singlefin.openGroupPage(this._rootPath + pageName, page, parameters, models);
        }
        setModelValue(property, value) {
            SinglefinModule.Runtime.setProperty(property, this._singlefin.models, value);
        }
        getModelValue(property) {
            return SinglefinModule.Runtime.getProperty(this._singlefin.models, property);
        }
    }
    SinglefinModule.App = App;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class CheckboxBinding {
        in(container, element, data, key) {
            if (!element.is(':checkbox')) {
                return;
            }
            if (!key) {
                return;
            }
            var checked = element.is(":checked");
            var value = element.val();
            if (checked) {
                SinglefinModule.Runtime.setProperty(key, data, value);
            }
            element.on("click", {
                data: data,
                key: key
            }, (event) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var inputElement = $(event.currentTarget);
                var value = inputElement.val();
                SinglefinModule.Runtime.setProperty(_key, _data, value);
            });
        }
        is(container, element, data, key) {
            if (!element.is(':checkbox')) {
                return;
            }
            if (!key) {
                return;
            }
            var checked = element.is(":checked");
            SinglefinModule.Runtime.setProperty(key, data, checked);
            element.on("click", {
                data: data,
                key: key
            }, (event) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var inputElement = $(event.currentTarget);
                var checked = inputElement.is(":checked");
                SinglefinModule.Runtime.setProperty(_key, _data, checked);
            });
        }
    }
    SinglefinModule.CheckboxBinding = CheckboxBinding;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class ConfigLoader {
        constructor() {
            this._bodyName = "";
            this._modulesCode = "";
        }
        load(config, singlefin) {
            var resources = config.resources;
            var models = config.models;
            var pages = config.pages;
            if (!pages) {
                throw "pages cannot be null or undefined";
            }
            this._bodyName = Object.keys(pages)[0];
            this.processResources(resources, singlefin);
            if (models) {
                var module = this.getModule(this._bodyName);
                module.models = {};
                for (var modelKey in models) {
                    module.models[modelKey] = {};
                    var path = "['" + this._bodyName + "'].models['" + modelKey + "']";
                    module.models[modelKey] = this.unbundleJavascriptObject(path, "object", models[modelKey]);
                }
                singlefin.models = module.models;
            }
            singlefin.addBody(this._bodyName);
            var body = pages[this._bodyName];
            if (body.view) {
                singlefin.getBody().htmlElement = null;
            }
            singlefin.getBody().view = this.unbundleView(body.view);
            var module = this.getModule(this._bodyName);
            module.controllers = [];
            module.controllers = this.unbundleJavascriptObjects("['" + this._bodyName + "'].controllers", "array", body.controllers);
            singlefin.getBody().controllers = module.controllers;
            singlefin.getBody().styles = this.unbundleFiles(body.styles);
            singlefin.getBody().scripts = this.unbundleFiles(body.scripts);
            singlefin.getBody().events = this.processEvents(body.events);
            this.addHandlers(singlefin.body, singlefin);
            this.processPages("append", singlefin.body, body.append, config.widgets, singlefin, false, singlefin.body);
            this.processPages("replace", singlefin.body, body.replace, config.widgets, singlefin, false, singlefin.body);
            this.processPages("group", singlefin.body, body.group, config.widgets, singlefin, false, singlefin.body);
            this.processPages("unwind", singlefin.body, body.unwind, config.widgets, singlefin, false, singlefin.body);
            return this.loadModules();
        }
        processResources(resources, singlefin) {
            singlefin.resources = {};
            var module = this.getModule(this._bodyName);
            module.resources = {};
            for (var languageKey in resources) {
                module.resources[languageKey] = {};
                var path = "['" + this._bodyName + "'].resources['" + languageKey + "']";
                for (var resourceKey in resources[languageKey]) {
                    path += "['" + resourceKey + "']";
                    module.resources[languageKey][resourceKey] = this.unbundleJavascriptObject(path, "object", resources[languageKey][resourceKey]); //serve il path...
                }
            }
            singlefin.resources = module.resources;
        }
        addHandlers(pagePath, singlefin) {
            /*var _page: any = singlefin.pages[pagePath];

            if(_page.events) {
                for(var h=0; h<_page.events.length; h++) {
                    if(!singlefin.handlers[_page.events[h]]) {
                        singlefin.handlers[_page.events[h]] = [];
                    }

                    singlefin.handlers[_page.events[h]].push(pagePath);
                }
                
            }*/
        }
        processPages(action, containerName, pages, widgets, singlefin, isWidget, appRootPath) {
            if (!action) {
                return;
            }
            if (!containerName) {
                throw "container missed";
            }
            if (pages == null) {
                return;
            }
            for (var i = 0; i < pages.length; i++) {
                var pageName = Object.keys(pages[i])[0];
                var page = pages[i][pageName];
                page.isWidget = isWidget;
                page.appRootPath = appRootPath;
                var disabled = false;
                if (page.parameters) {
                    disabled = page.parameters.disabled;
                }
                var pagePath = containerName + "/" + pageName;
                if (page.widget) {
                    page.isWidget = true;
                    page.view = widgets[page.widget].view;
                    page.controllers = widgets[page.widget].controllers;
                    page.replace = widgets[page.widget].replace;
                    page.append = widgets[page.widget].append;
                    page.group = widgets[page.widget].group;
                    page.unwind = widgets[page.widget].unwind;
                    page.styles = widgets[page.widget].styles;
                    page.scripts = widgets[page.widget].scripts;
                    page.models = widgets[page.widget].models;
                    page.appRootPath = pagePath;
                }
                var replaceChildren = this.processChildrenPage(pagePath, page.replace);
                var appendChildren = this.processChildrenPage(pagePath, page.append);
                var groupChildren = this.processChildrenPage(pagePath, page.group);
                var unwindChildren = this.processChildrenPage(pagePath, page.unwind);
                page.view = this.unbundleView(page.view);
                var module = this.getModule(pagePath);
                module.controllers = this.unbundleJavascriptObjects("['" + pagePath + "'].controllers", "array", page.controllers);
                page.controllers = module.controllers;
                page.styles = this.unbundleFiles(page.styles);
                page.scripts = this.unbundleFiles(page.scripts);
                page.events = this.processEvents(page.events);
                singlefin.addPage(pageName, disabled, action, pagePath, containerName, page.view, page.controllers, replaceChildren, appendChildren, groupChildren, unwindChildren, page.list, page.events, page.parameters, page.isWidget, page.styles, page.scripts, page.models, page.appRootPath);
                this.processPages("replace", pagePath, page.replace, widgets, singlefin, page.isWidget, page.appRootPath);
                this.processPages("append", pagePath, page.append, widgets, singlefin, page.isWidget, page.appRootPath);
                this.processPages("group", pagePath, page.group, widgets, singlefin, page.isWidget, page.appRootPath);
                this.processPages("unwind", pagePath, page.unwind, widgets, singlefin, page.isWidget, page.appRootPath);
                this.addHandlers(pagePath, singlefin);
            }
        }
        processChildrenPage(parentPagePath, childrenPage) {
            var children = [];
            if (!childrenPage) {
                return children;
            }
            for (var i = 0; i < childrenPage.length; i++) {
                var childPageName = Object.keys(childrenPage[i])[0];
                var childPagePath = parentPagePath + "/" + childPageName;
                children.push(childPagePath);
            }
            return children;
        }
        processEvents(events) {
            for (var eventKey in events) {
                var event = events[eventKey];
                for (var i = 0; i < event.length; i++) {
                    event[i] = this.bundleRequest(event[i]);
                }
            }
            return events;
        }
        bundleRequest(eventHandler) {
            if (!eventHandler) {
                return eventHandler;
            }
            if (!eventHandler.request) {
                return eventHandler;
            }
            eventHandler.request.handler = new SinglefinModule.Request(eventHandler.request);
            return eventHandler;
        }
        unbundleView(view) {
            if (!view) {
                return;
            }
            return this.decodeBase64(view);
        }
        unbundleFiles(_files) {
            if (!_files) {
                return;
            }
            var files = [];
            for (var i = 0; i < _files.length; i++) {
                files.push(this.decodeBase64(_files[i]));
            }
            ;
            return files;
        }
        unbundleJson(json) {
            var jsonString = this.decodeBase64(json);
            return JSON.parse(jsonString);
        }
        unbundleJavascriptObjects(path, moduleType, _objects) {
            if (!_objects) {
                return;
            }
            var objects = [];
            for (var i = 0; i < _objects.length; i++) {
                var object = this.unbundleJavascriptObject(path, moduleType, _objects[i]);
                if (object) {
                    objects.push(object);
                }
            }
            ;
            return objects;
        }
        unbundleJavascriptObject(path, moduleType, javascriptObject) {
            var controllerContent = this.decodeBase64(javascriptObject);
            if (controllerContent.startsWith("class")) {
                return this.addModuleCode(path, moduleType, controllerContent);
            }
            //TODO: workaround: tutti i moduli (controller, model, ecc.) devono essere convertiti in classi e il define va eliminato, così come l'eval!
            var define = (_obj) => {
                if (typeof _obj === "function") {
                    return _obj();
                }
                return _obj;
            };
            var obj = eval(controllerContent);
            return obj;
        }
        decodeBase64(data) {
            return decodeURIComponent(escape(atob(data)));
        }
        getModule(path) {
            if (!SinglefinModule.Singlefin.moduleMap[path]) {
                SinglefinModule.Singlefin.moduleMap[path] = {};
            }
            return SinglefinModule.Singlefin.moduleMap[path];
        }
        addModuleCode(path, moduleType, code) {
            if (moduleType == "array") {
                this._modulesCode += `Singlefin.moduleMap` + path + `.push(new ` + code + `())\n`;
            }
            else {
                this._modulesCode += `Singlefin.moduleMap` + path + ` = new ` + code + `()\n`;
            }
            return null;
        }
        loadModules() {
            return new Promise((resolve, reject) => {
                var script = document.createElement("script");
                script.type = "text/javascript";
                this._modulesCode += `\nSinglefin.loadModuleCallbacks["` + this._bodyName + `"]();`;
                script.text = this._modulesCode;
                SinglefinModule.Singlefin.loadModuleCallbacks[this._bodyName] = (() => {
                    resolve();
                });
                $('head').append(script);
            });
        }
    }
    SinglefinModule.ConfigLoader = ConfigLoader;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    let DataProxy = /** @class */ (() => {
        class DataProxy {
            constructor(_data) {
                this._proxy = null;
                this._data = _data;
                this._proxy = _data;
                if (this._data != null && typeof this._data == "object") {
                    //this._proxy = new Proxy(this._data, DataProxy.newProxyHandler());
                }
            }
            get proxy() {
                return this._proxy;
            }
            get data() {
                return this._data;
            }
            addHandlers(page, dataProxyHandlers) {
                DataProxy._dataProxyHandlers[page.path] = dataProxyHandlers;
            }
            static newProxyHandler() {
                //return new BindingHandler(null);
                /*return {
                    get: (target: any, key: any): any => {
                        //WORK-AROUND: for Date object...
                        if(target[key] && typeof target[key].getMonth === 'function') {
                            return target[key];
                        }
    
                        if (typeof target[key] === 'object' && target[key] !== null) {
                            return new Proxy(target[key], DataProxy.newProxyHandler())
                        }
    
                        return target[key];
                    },
                    set: (target: any, key: any, value: any) => {
                        target[key] = value;
    
                        for(var dataProxyHandlerKey in DataProxy._dataProxyHandlers) {
                            var dataProxyHandlers: DataProxyHandler[] = DataProxy._dataProxyHandlers[dataProxyHandlerKey];
    
                            for(var i=0; i<dataProxyHandlers.length; i++) {
                                dataProxyHandlers[i].handler(dataProxyHandlers[i].parameters);
                            }
                        }
                        
                        return true;
                    }
                };*/
            }
        }
        DataProxy._dataProxyHandlers = {};
        return DataProxy;
    })();
    SinglefinModule.DataProxy = DataProxy;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class DataProxyHandler {
        constructor(parameters, handler) {
            this._handler = null;
            this._parameters = parameters;
            this._handler = handler;
        }
        get parameters() {
            return this._parameters;
        }
        get handler() {
            return this._handler;
        }
    }
    SinglefinModule.DataProxyHandler = DataProxyHandler;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class Loader {
        load(paths, pathsMap) {
            return new Promise((resolve, reject) => {
                var normalizedPaths = this.normalizePaths(paths, pathsMap);
                require(normalizedPaths, function () {
                    resolve();
                }, function (error) {
                    console.error("load module error: " + error);
                    reject("load module error: " + error);
                });
            });
        }
        getInstance(path, pathsMap) {
            var normalizedPath = this.normalizePath(path, pathsMap);
            return require(normalizedPath);
        }
        normalizePath(path, pathsMap) {
            if (!pathsMap) {
                return path;
            }
            var pathMarkup = this.resolvePath(path);
            if (pathMarkup) {
                var itemPath = pathsMap[pathMarkup[1]];
                return path.replace(pathMarkup[0], itemPath);
            }
            return path;
        }
        normalizePaths(paths, pathsMap) {
            var normalizedPaths = [];
            if (!pathsMap) {
                return paths;
            }
            for (var i = 0; i < paths.length; i++) {
                normalizedPaths.push(this.normalizePath(paths[i], pathsMap));
            }
            return normalizedPaths;
        }
        resolvePath(path) {
            var pathRegExp = new RegExp("@([a-z0-9_-]+)");
            var pathMarkup = pathRegExp.exec(path);
            return pathMarkup;
        }
    }
    SinglefinModule.Loader = Loader;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class Page {
        constructor(app, name, disabled, action, container, path, view, controllers, replace, append, group, unwind, list, events, parameters, isWidget, styles, scripts, models) {
            this._disabled = false;
            this._index = 0;
            this._groupIndex = 0;
            this._groupNextStepEnabled = true;
            this._groupPreviousStepEnabled = true;
            this._binding = new SinglefinModule.Binding();
            this._app = app;
            this._name = name;
            this._disabled = disabled;
            this._action = action;
            this._container = container;
            this._path = path;
            this._view = view;
            this._controllers = controllers,
                this._replace = replace,
                this._append = append,
                this._group = group,
                this._unwind = unwind,
                this._list = list,
                this._events = events,
                this._parameters = parameters;
            this._isWidget = isWidget;
            this._styles = styles;
            this._scripts = scripts;
            this._models = models;
        }
        get app() {
            return this._app;
        }
        set app(value) {
            this._app = value;
        }
        get name() {
            return this._name;
        }
        set name(value) {
            this._name = value;
        }
        get disabled() {
            return this._disabled;
        }
        set disabled(value) {
            this._disabled = value;
        }
        get action() {
            return this._action;
        }
        set action(value) {
            this._action = value;
        }
        get container() {
            return this._container;
        }
        set container(value) {
            this._container = value;
        }
        get path() {
            return this._path;
        }
        set path(value) {
            this._path = value;
        }
        get view() {
            return this._view;
        }
        set view(value) {
            this._view = value;
        }
        get controllers() {
            return this._controllers;
        }
        set controllers(value) {
            this._controllers = value;
        }
        get replace() {
            return this._replace;
        }
        set replace(value) {
            this._replace = value;
        }
        get append() {
            return this._append;
        }
        set append(value) {
            this._append = value;
        }
        get group() {
            return this._group;
        }
        set group(value) {
            this._group = value;
        }
        get unwind() {
            return this._unwind;
        }
        set unwind(value) {
            this._unwind = value;
        }
        get list() {
            return this._list;
        }
        set list(value) {
            this._list = value;
        }
        get events() {
            return this._events;
        }
        set events(value) {
            this._events = value;
        }
        get parameters() {
            return this._parameters;
        }
        set parameters(value) {
            this._parameters = value;
        }
        get isWidget() {
            return this._isWidget;
        }
        set isWidget(value) {
            this._isWidget = value;
        }
        get styles() {
            return this._styles;
        }
        set styles(value) {
            this._styles = value;
        }
        get scripts() {
            return this._scripts;
        }
        set scripts(value) {
            this._scripts = value;
        }
        get models() {
            return this._models;
        }
        set models(value) {
            this._models = value;
        }
        get htmlElement() {
            return this._htmlElement;
        }
        set htmlElement(value) {
            this._htmlElement = value;
        }
        get index() {
            return this._index;
        }
        set index(value) {
            this._index = value;
        }
        get groupIndex() {
            return this._groupIndex;
        }
        set groupIndex(value) {
            this._groupIndex = value;
        }
        get groupNextStepEnabled() {
            return this._groupNextStepEnabled;
        }
        set groupNextStepEnabled(value) {
            this._groupNextStepEnabled = value;
        }
        get groupPreviousStepEnabled() {
            return this._groupPreviousStepEnabled;
        }
        set groupPreviousStepEnabled(value) {
            this._groupPreviousStepEnabled = value;
        }
        draw(singlefin, parameters, models) {
            return new Promise((resolve, reject) => {
                this.drawBody(singlefin, parameters, models).then(() => {
                    this.drawContainer(singlefin, this, this.container, parameters, models).then((htmlContainerElement) => {
                        this.handleEvent(singlefin, this.events, "open", this, parameters, models).then((viewParameters) => {
                            this.htmlElement = this.renderView(singlefin, this, viewParameters, models);
                            this.addEventsHandlers(singlefin, this.app, this, this.htmlElement, viewParameters, models);
                            this.bind(singlefin, this.htmlElement, viewParameters, models);
                            this.drawItems(singlefin, this, viewParameters, models).then(() => {
                                this.addHtmlElement(htmlContainerElement, this, singlefin);
                                this.fireShowHtmlElementEvent();
                                this.handleEvent(singlefin, this.events, "show", this, viewParameters, models).then(() => {
                                    resolve(this.htmlElement);
                                }, () => {
                                    console.error("draw error");
                                    reject("draw error");
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
        redraw(singlefin, parameters, models) {
            return new Promise((resolve, reject) => {
                this.drawContainer(singlefin, this, this.container, parameters, models).then((htmlContainerElement) => {
                    this.handleEvent(singlefin, this.events, "refresh", this, parameters, models).then((viewParameters) => {
                        var previousPageHtmlElement = this.htmlElement;
                        this.htmlElement = this.renderView(singlefin, this, viewParameters, models);
                        this.addEventsHandlers(singlefin, this.app, this, this.htmlElement, viewParameters, models);
                        this.bind(singlefin, this.htmlElement, viewParameters, models);
                        this.drawItems(singlefin, this, viewParameters, models).then(() => {
                            previousPageHtmlElement.replaceWith(this.htmlElement);
                            this.appendStyles();
                            this.appendScripts();
                            this.fireShowHtmlElementEvent();
                            this.handleEvent(singlefin, this.events, "show", this, viewParameters, models).then(() => {
                                resolve(this.htmlElement);
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
        getCurrentGroupPage(singlefin) {
            if (!this.group) {
                return null;
            }
            var pagePath = this.group[this.groupIndex];
            return singlefin.pages[pagePath];
        }
        nextStep(singlefin, parameters, models) {
            var currentPage = this.getCurrentGroupPage(singlefin);
            this.groupIndex = this.groupIndex + 1;
            if (this.groupIndex >= this.group.length) {
                this.groupIndex = this.group.length - 1;
            }
            return new Promise((resolve, reject) => {
                this.nextController(singlefin, currentPage, parameters).then(() => {
                    return this.redraw(singlefin, parameters, models);
                }, () => {
                    console.error("next step error");
                    reject("next step error");
                }).then((html) => {
                    resolve(html);
                }, () => {
                    console.error("next step error");
                    reject("next step error");
                });
            });
        }
        previousStep(singlefin, parameters, models) {
            var currentPage = this.getCurrentGroupPage(singlefin);
            this.groupIndex = this.groupIndex - 1;
            if (this.groupIndex < 0) {
                this.groupIndex = 0;
            }
            return new Promise((resolve, reject) => {
                this.previousController(singlefin, currentPage, parameters).then(() => {
                    return this.redraw(singlefin, parameters, models);
                }, () => {
                    console.error("previous step error");
                    reject("previous step error");
                }).then((html) => {
                    resolve(html);
                }, () => {
                    console.error("previous step error");
                    reject("previous step error");
                });
            });
        }
        openGroupPageByIndex(singlefin, index, parameters, models) {
            this.groupIndex = index;
            if (this.groupIndex < 0) {
                this.groupIndex = 0;
            }
            if (this.groupIndex >= this.group.length) {
                this.groupIndex = this.group.length - 1;
            }
            return this.redraw(singlefin, parameters, models);
        }
        openGroupPage(singlefin, pageName, parameters, models) {
            var groupIndex = this.group.indexOf(pageName);
            if (groupIndex == -1) {
                console.error("group page " + pageName + " not found");
                Promise.reject("group page " + pageName + " not found");
            }
            this.groupIndex = groupIndex;
            return this.redraw(singlefin, parameters, models);
        }
        setNextGroupStepEnabled(singlefin, enabled) {
            var nextPage = singlefin.pages[this.group[this.groupIndex]];
            if (!nextPage.parameters) {
                nextPage.parameters = {};
            }
            nextPage.parameters.nextEnabled = enabled;
        }
        isNextGroupStepEnabled(singlefin) {
            var nextPage = singlefin.pages[this.group[this.groupIndex]];
            if (nextPage.parameters) {
                return nextPage.parameters.nextEnabled;
            }
            return true;
        }
        setPreviousGroupStepEnabled(singlefin, enabled) {
            var previousPage = singlefin.pages[this.group[this.groupIndex]];
            if (!previousPage.parameters) {
                previousPage.parameters = {};
            }
            previousPage.parameters.previousEnabled = enabled;
        }
        isPreviousGroupStepEnabled(singlefin) {
            var previousPage = singlefin.pages[this.group[this.groupIndex]];
            if (previousPage.parameters) {
                return previousPage.parameters.previousEnabled;
            }
            return true;
        }
        drawBody(singlefin, parameters, models) {
            var body = singlefin.getBody();
            if (body.htmlElement) {
                return Promise.resolve(body.htmlElement);
            }
            return new Promise((resolve, reject) => {
                this.handleEvent(singlefin, body.events, "open", body, parameters, models).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                    body.htmlElement = $("#" + body.name);
                    body.appendStyles();
                    body.appendScripts();
                    var view = this.renderView(singlefin, body, viewParameters, models);
                    body.htmlElement.append(view);
                    this.handleEvent(singlefin, body.events, "show", body, viewParameters, models).then(() => {
                        resolve(body.htmlElement);
                    }, () => {
                        console.error("draw body error");
                        reject("draw body error");
                    });
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
        drawContainer(singlefin, page, containerName, parameters, models) {
            var container = singlefin.pages[containerName];
            if (!container) {
                console.error("container page '" + containerName + "' not found");
                return Promise.reject("container page '" + containerName + "' not found");
            }
            if (!container.htmlElement) {
                return this.drawParent(singlefin, page, containerName, parameters, models);
            }
            return Promise.resolve(container.htmlElement);
        }
        drawItems(singlefin, parent, parameters, models) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this.drawChildren(singlefin, parent, parent.replace, parameters, models).then(() => {
                    return this.drawChildren(singlefin, parent, parent.append, parameters, models);
                }, () => {
                    console.error("replace items error");
                    reject("replace items error");
                }).then(() => {
                    return this.drawChildren(singlefin, parent, parent.group, parameters, models);
                }, () => {
                    console.error("append items error");
                    reject("append items error");
                }).then(() => {
                    return this.drawChildren(singlefin, parent, parent.unwind, parameters, models);
                }, () => {
                    console.error("group items error");
                    reject("group items error");
                }).then(() => {
                    resolve();
                }, () => {
                    console.error("unwind items error");
                    reject("unwind items error");
                });
            }));
        }
        drawParent(singlefin, page, pageName, parameters, models) {
            return new Promise((resolve, reject) => {
                if (pageName == singlefin.body) {
                    return resolve(singlefin.getBody().htmlElement);
                }
                var parentPage = singlefin.pages[pageName];
                if (!parentPage) {
                    console.error("page not found");
                    return reject("page not found");
                }
                this.drawContainer(singlefin, page, parentPage.container, parameters, models).then((htmlContainerElement) => {
                    this.handleEvent(singlefin, parentPage.events, "open", parentPage, parameters, models).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                        parentPage.htmlElement = this.renderView(singlefin, parentPage, viewParameters, models);
                        this.addEventsHandlers(singlefin, parentPage.app, parentPage, htmlContainerElement, viewParameters, models);
                        parentPage.bind(singlefin, htmlContainerElement, viewParameters, models);
                        this.addHtmlElement(htmlContainerElement, parentPage, singlefin);
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
        drawChildren(singlefin, parent, children, parameters, models) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!children) {
                    return resolve();
                }
                for (var i = 0; i < children.length; i++) {
                    var childPageName = children[i];
                    var childPage = singlefin.pages[childPageName];
                    if (childPage.action == "group") {
                        if (parent.groupIndex != i) {
                            continue;
                        }
                    }
                    if (childPage.disabled == true) {
                        continue;
                    }
                    yield this.handleEvent(singlefin, childPage.events, "open", childPage, parameters, models).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                        if (childPage.action == "unwind") {
                            yield this.unwindItems(singlefin, parent, childPageName, childPage, viewParameters, parameters, models).then(() => __awaiter(this, void 0, void 0, function* () {
                            }), (ex) => {
                                if (ex) {
                                    console.error("draw children error");
                                    return reject("draw children error");
                                }
                            });
                        }
                        else {
                            childPage.htmlElement = this.renderView(singlefin, childPage, viewParameters, models);
                            this.addEventsHandlers(singlefin, childPage.app, childPage, childPage.htmlElement, viewParameters, models);
                            childPage.bind(singlefin, childPage.htmlElement, viewParameters, models);
                            this.addHtmlElement(parent.htmlElement, childPage, singlefin);
                            yield this.drawItems(singlefin, childPage, viewParameters, models).then(() => __awaiter(this, void 0, void 0, function* () {
                                yield this.handleEvent(singlefin, childPage.events, "show", childPage, viewParameters, models).then(() => {
                                }, () => {
                                    console.error("draw children error");
                                    reject("draw children error");
                                });
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
        unwindItems(singlefin, parent, pageName, page, parameters, controllerParameters, models) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                var list = parameters;
                if (page.list && page.list.from) {
                    list = SinglefinModule.Runtime.getProperty(singlefin.models, page.list.from);
                }
                if (!Array.isArray(list)) {
                    console.error("unwind error page '" + pageName + "': controller must return an array");
                    return reject("unwind error page '" + pageName + "': controller must return an array");
                }
                //TODO: rimuovere i surrogati per liberare memoria e gli eventi!?
                for (var i = 0; i < list.length; i++) {
                    var surrogate = singlefin.addSurrogate(page.name + "#" + i, pageName + "/" + page.name + "#" + i, page.container, page);
                    surrogate.index = i;
                    yield this.handleEvent(singlefin, surrogate.events, "unwind", surrogate, list[i], models).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                        surrogate.htmlElement = this.renderView(singlefin, surrogate, viewParameters, models);
                        this.addEventsHandlers(singlefin, page.app, surrogate, surrogate.htmlElement, viewParameters, models);
                        surrogate.bind(singlefin, surrogate.htmlElement, viewParameters, models);
                        yield this.drawItems(singlefin, surrogate, viewParameters, models).then(() => __awaiter(this, void 0, void 0, function* () {
                            this.addHtmlElement(parent.htmlElement, surrogate, singlefin);
                            //parent.bind(singlefin, parent.htmlElement, viewParameters, models);
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
                if (page.list && page.list.from) {
                    SinglefinModule.ProxyHandlerMap.registerPage(page.path);
                    var valuePath = page.list.from;
                    var data = singlefin.modelProxy.data;
                    var valuePath = valuePath.replace(".$", "[" + page.index + "]");
                    var elementBinding = new SinglefinModule.ListBinding(page.htmlElement, "list", null, singlefin, page, page.list);
                    elementBinding.watch(singlefin, page, null, valuePath, data, parameters);
                    var proxyPath = SinglefinModule.Runtime.getParentPath(valuePath);
                    var object = SinglefinModule.Runtime.getParentInstance(data, valuePath);
                    var property = SinglefinModule.Runtime.getPropertyName(valuePath);
                    var proxyHandler = SinglefinModule.ProxyHandlerMap.newProxy(proxyPath, object);
                    SinglefinModule.ProxyHandlerMap.addElementBinding(page.path, proxyPath, property, elementBinding);
                    SinglefinModule.Runtime.setProperty(proxyPath, data, proxyHandler.proxy);
                    var value = SinglefinModule.Runtime.getProperty(data, valuePath);
                    elementBinding.init(value);
                }
                resolve();
            }));
        }
        addHandleEvent(singlefin, htmlElement, eventType, event, page, parameters, pageModels) {
            if (!page.events) {
                return;
            }
            var events = page.events[event];
            if (!events) {
                return;
            }
            htmlElement.on(eventType, {
                event: event,
                app: singlefin,
                models: singlefin.models,
                page: page,
                data: parameters,
                pageModels: pageModels
            }, (event) => {
                var eventData = event.data;
                eventData.page.handleEvent(singlefin, eventData.page.events, eventData.event, eventData.page, eventData.data, eventData.pageModels, event);
            });
        }
        handleEvent(singlefin, events, event, page, parameters, pageModels, eventObject) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                var result = parameters;
                if (!events) {
                    return resolve(result);
                }
                var eventsList = events[event];
                if (!eventsList) {
                    return resolve(result);
                }
                for (var i = 0; i < eventsList.length; i++) {
                    result = yield this.handleAction(singlefin, eventsList[i], page, parameters, result, pageModels, eventObject);
                }
                resolve(result);
            }));
        }
        handleAction(singlefin, action, page, parameters, _result, pageModels, eventObject) {
            return __awaiter(this, void 0, void 0, function* () {
                var result = _result;
                yield this.handleControllerEvent(singlefin, action, page, parameters, eventObject).then((_result) => __awaiter(this, void 0, void 0, function* () {
                    result = _result;
                    return this.handleModelEvent(singlefin, action, page, parameters, pageModels);
                }), (ex) => {
                    if (ex) {
                        console.error("page '" + page.name + "' handle event error: " + ex);
                    }
                }).then(() => __awaiter(this, void 0, void 0, function* () {
                    return this.handlePageEvent(singlefin, action);
                }), (ex) => {
                    if (ex) {
                        console.error("page '" + page.name + "' handle event error: " + ex);
                    }
                }).then(() => __awaiter(this, void 0, void 0, function* () {
                    return this.handleGroupEvent(singlefin, action);
                }), (ex) => {
                    if (ex) {
                        console.error("page '" + page.name + "' handle event error: " + ex);
                    }
                }).then(() => __awaiter(this, void 0, void 0, function* () {
                    return this.handleRequestEvent(singlefin, action, page, parameters, pageModels, eventObject);
                }), (ex) => {
                    if (ex) {
                        console.error("page '" + page.name + "' handle event error: " + ex);
                    }
                }).then(() => __awaiter(this, void 0, void 0, function* () {
                    return this.handleBrowserEvent(singlefin, action, page, parameters, pageModels, eventObject);
                }), (ex) => {
                    if (ex) {
                        console.error("page '" + page.name + "' handle event error: " + ex);
                    }
                });
                return result;
            });
        }
        handleControllerEvent(singlefin, delegate, page, parameters, event) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                var result = parameters;
                if (!delegate.controller) {
                    return resolve(result);
                }
                for (var i = 0; i < page.controllers.length; i++) {
                    var controller = page.controllers[i];
                    var controllerMethod = controller[delegate.controller];
                    if (controllerMethod) {
                        var promise = controllerMethod.call(controller, page.app, page, parameters, event);
                        if (promise) {
                            yield promise.then((_result) => __awaiter(this, void 0, void 0, function* () {
                                result = _result;
                            }), (ex) => {
                                if (ex) {
                                    console.error("page '" + page.name + "' handle controller error: " + ex);
                                }
                                reject(ex);
                            });
                        }
                    }
                }
                resolve(result);
            }));
        }
        handleModelEvent(singlefin, delegate, page, parameters, pageModels) {
            if (!delegate.model) {
                return Promise.resolve();
            }
            if (pageModels) {
                var modelMethodName = SinglefinModule.Runtime.getPropertyName(delegate.model);
                if (pageModels[modelMethodName]) {
                    var pageModelMethodName = pageModels[modelMethodName].binding;
                    var model = SinglefinModule.Runtime.getParentInstance(singlefin.models, pageModelMethodName);
                    var modelMethod = SinglefinModule.Runtime.getProperty(singlefin.models, pageModelMethodName);
                    return modelMethod.call(model, page.app, singlefin.models, parameters);
                }
            }
            var model = SinglefinModule.Runtime.getParentInstance(singlefin.models, delegate.model);
            var modelMethod = SinglefinModule.Runtime.getProperty(singlefin.models, delegate.model);
            return modelMethod.call(model, page.app, singlefin.models, parameters);
        }
        handlePageEvent(singlefin, delegate) {
            if (!delegate.page) {
                return Promise.resolve();
            }
            if (delegate.page.open) {
                return singlefin.open(delegate.page.open, delegate.page.parameters, delegate.page.models);
            }
            else if (delegate.page.refresh) {
                return singlefin.refresh(delegate.page.refresh, delegate.page.parameters, delegate.page.models);
            }
            else if (delegate.page.close) {
                return singlefin.close(delegate.page.close, delegate.page.parameters);
            }
            return Promise.reject("method '" + delegate.page + "' not supported");
        }
        handleGroupEvent(singlefin, delegate) {
            if (!delegate.group) {
                return Promise.resolve();
            }
            if (delegate.group.open) {
                return singlefin.openGroupPage(delegate.group.open, delegate.group.page, delegate.group.parameters, delegate.group.models);
            }
            return Promise.reject("method '" + delegate.page + "' not supported");
        }
        handleRequestEvent(singlefin, delegate, page, parameters, result, pageModels, eventObject) {
            if (!delegate.request) {
                return Promise.resolve();
            }
            var request = delegate.request.handler;
            return request.call(singlefin, page, singlefin.models, result, pageModels);
        }
        handleBrowserEvent(singlefin, delegate, page, parameters, result, pageModels, eventObject) {
            if (!delegate.browser) {
                return Promise.resolve();
            }
            if (delegate.browser == "refresh") {
                window.location.href = window.location.href;
            }
        }
        renderView(singlefin, page, data, models) {
            if (!page.view) {
                return $();
            }
            var group = null;
            var currentGroupPage = page.getCurrentGroupPage(singlefin);
            if (currentGroupPage) {
                group = {
                    page: currentGroupPage.name,
                    index: page.groupIndex
                };
            }
            var html = this.resolveMarkup(page.view, {
                data: data,
                parameters: page.parameters,
                resources: singlefin.defaultResources,
                models: singlefin.models,
                group: group
            });
            html = this.resolveBracketsMarkup(html, singlefin.models, models);
            var htmlElement = $(html);
            return htmlElement;
        }
        bind(singlefin, htmlElement, data, models) {
            this._binding.bind(singlefin, this, htmlElement, data, models);
        }
        nextController(singlefin, page, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!page.controllers) {
                    return resolve(parameters);
                }
                var result = parameters;
                for (var i = 0; i < page.controllers.length; i++) {
                    if (page.controllers[i].next) {
                        yield page.controllers[i].next(singlefin, page, result).then((_result) => __awaiter(this, void 0, void 0, function* () {
                            result = _result;
                        }), (ex) => {
                            if (ex) {
                                console.error("next controller error: " + ex);
                            }
                            reject(ex);
                        });
                    }
                }
                resolve(result);
            }));
        }
        previousController(singlefin, page, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!page.controllers) {
                    return resolve(parameters);
                }
                var result = parameters;
                for (var i = 0; i < page.controllers.length; i++) {
                    if (page.controllers[i].previous) {
                        yield page.controllers[i].previous(singlefin, page, result).then((_result) => __awaiter(this, void 0, void 0, function* () {
                            result = _result;
                        }), (ex) => {
                            if (ex) {
                                console.error("next controller error: " + ex);
                            }
                            reject(ex);
                        });
                    }
                }
                resolve(result);
            }));
        }
        resolveMarkup(markup, context) {
            try {
                var markupRegex = /<%(.[\s\S]*?)%>/m; //TODO: il tag singleline (s) è supportato soltanto in ES2018; da modificare se si vogliono gestire le interruzioni linea \n
                var str = markup;
                var match = markupRegex.exec(str);
                while (match) {
                    var result = null;
                    var code = `(() => {
						var data = context.data;
						var parameters = context.parameters;
						var resources = context.resources;
						var models = context.models;
						var model = context.model;
						var group = context.group;
						
						result = ` + match[1] + `;
					})()`;
                    //TODO: eliminare eval e inserire il codice nella pagina
                    eval(code);
                    str = str.replace(match[0], result);
                    match = markupRegex.exec(str);
                }
                return str;
            }
            catch (ex) {
                console.error("resolve markup error: " + ex);
                return markup;
            }
        }
        resolveBracketsMarkup(markup, models, pageModels) {
            try {
                var markupRegex = /{{(.[\s\S]*?)}}/m; //TODO: il tag singleline (s) è supportato soltanto in ES2018; da modificare se si vogliono gestire le interruzioni linea \n
                var str = markup;
                var match = markupRegex.exec(str);
                while (match) {
                    var valuePath = match[1];
                    valuePath = valuePath.replace(".$", "[" + this.index + "]");
                    valuePath = valuePath.trim();
                    if (pageModels) {
                        if (pageModels[valuePath]) {
                            valuePath = pageModels[valuePath].binding;
                        }
                    }
                    var value = SinglefinModule.Runtime.getProperty(models, valuePath);
                    str = str.replace(match[0], value);
                    match = markupRegex.exec(str);
                }
                return str;
            }
            catch (ex) {
                console.error("resolve markup error: " + ex);
                return markup;
            }
        }
        addHtmlElement(container, page, singlefin) {
            var element = container;
            var elements = $();
            page.appendStyles();
            page.appendScripts();
            var pageName = page.name.split('#')[0];
            var pageTag = container.find("page[" + pageName + "]");
            var containerPagesAttribute = container.find("[pages]");
            containerPagesAttribute.each((i, item) => {
                var pageAttributeValues = $(item).attr("pages");
                var pages = pageAttributeValues.split(',');
                if (pages.indexOf(pageName) >= 0) {
                    element = elements.add($(item));
                }
            });
            var containerPageAttribute = container.find(`[page="` + pageName + `"]`);
            if (containerPageAttribute.length > 0) {
                element = elements.add(containerPageAttribute);
            }
            if (pageTag.length > 0) {
                pageTag.before(page.htmlElement);
                if (elements.length == 0) {
                    return;
                }
            }
            if (page.action == "replace") {
                element.html(page.htmlElement);
                var containerPage = singlefin.pages[page.container];
                containerPage.appendStyles();
                containerPage.appendScripts();
            }
            else if (page.action == "append") {
                element.append(page.htmlElement);
            }
            else if (page.action == "group") {
                element.html(page.htmlElement);
                var containerPage = singlefin.pages[page.container];
                containerPage.appendStyles();
                containerPage.appendScripts();
            }
            else if (page.action == "unwind") {
                element.append(page.htmlElement);
            }
        }
        fireShowHtmlElementEvent() {
            if (!this.htmlElement) {
                return;
            }
            this.htmlElement.find("select").trigger("singlefin:show");
        }
        appendStyles() {
            if (!this._styles) {
                return;
            }
            for (var i = 0; i < this._styles.length; i++) {
                this.htmlElement.append(`<style type='text/css'>` + this._styles[i] + `</style>`);
            }
        }
        appendScripts() {
            if (!this._scripts) {
                return;
            }
            for (var i = 0; i < this._scripts.length; i++) {
                var script = document.createElement("script");
                script.type = "text/javascript";
                script.text = this._scripts[i];
                this.htmlElement.append(script);
            }
        }
        addEventsHandlers(singlefin, app, page, element, parameters, pageModels) {
            if (!element) {
                return;
            }
            element.each((i, item) => {
                $.each(item.attributes, (i, attribute) => {
                    if (attribute.specified) {
                        if (attribute.name.startsWith("on-")) {
                            var onAttribute = attribute.name.split("on-");
                            var event = onAttribute[1];
                            var handlerList = [];
                            if (attribute.value) {
                                handlerList = attribute.value.split(",");
                            }
                            for (var n = 0; n < handlerList.length; n++) {
                                var handler = handlerList[n];
                                var paths = [];
                                if (singlefin.handlers[handler]) {
                                    paths = singlefin.handlers[handler];
                                }
                                this.addHandleEvent(singlefin, element, event, handler, page, parameters, pageModels);
                            }
                        }
                        if (attribute.name == "href") {
                            if (attribute.value.startsWith("page#")) {
                                var href = attribute.value;
                                var markup = href.split("#");
                                if (markup.length > 0) {
                                    var path = markup[1];
                                    element.on("click", (event) => {
                                        event.preventDefault();
                                        singlefin.open(path);
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
                this.addEventsHandlers(singlefin, app, page, $(item), parameters, pageModels);
            });
        }
        close(singlefin, parameters) {
            return new Promise((resolve, reject) => {
                this.closeController(this, parameters).then(() => {
                    this.closeItems(singlefin, this, parameters).then(() => {
                        if (this.disabled == true) {
                            this.htmlElement.remove();
                        }
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
        closeController(page, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!page.controllers) {
                    return resolve(parameters);
                }
                var result = parameters;
                for (var i = 0; i < page.controllers.length; i++) {
                    if (page.controllers[i].close) {
                        yield page.controllers[i].close(page).then((_result) => {
                            result = _result;
                        }, (ex) => {
                            console.error("close controller error: " + ex);
                            return reject("close controller error" + ex);
                        });
                    }
                }
                resolve(result);
            }));
        }
        closeItems(singlefin, page, parameters) {
            return new Promise((resolve, reject) => {
                if (page.group.length > 0) {
                    page.groupIndex = 0;
                }
                this.closeChildren(singlefin, page.replace, parameters).then(() => {
                    return this.closeChildren(singlefin, page.append, parameters);
                }, (ex) => {
                    if (ex) {
                        console.error("close itmes error");
                        reject("close itmes error");
                    }
                    else {
                        resolve();
                    }
                }).then(() => {
                    return this.closeChildren(singlefin, page.group, parameters);
                }, (ex) => {
                    if (ex) {
                        console.error("close itmes error");
                        reject("close itmes error");
                    }
                    else {
                        resolve();
                    }
                }).then(() => {
                    return this.closeChildren(singlefin, page.unwind, parameters);
                }, (ex) => {
                    if (ex) {
                        console.error("close itmes error");
                        reject("close itmes error");
                    }
                    else {
                        resolve();
                    }
                }).then(() => {
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
            });
        }
        closeChildren(singlefin, children, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!children) {
                    return resolve();
                }
                for (var i = 0; i < children.length; i++) {
                    var childName = children[i];
                    var page = singlefin.pages[childName];
                    if (!page) {
                        console.error("close children error: page '" + childName + "' not found");
                        return resolve();
                    }
                    yield this.closeItems(singlefin, page, parameters).then(() => __awaiter(this, void 0, void 0, function* () {
                        this.closeController(page, parameters).then(() => {
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
    SinglefinModule.Page = Page;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class RadioBinding {
        in(container, element, data, key) {
            if (!element.is(':radio')) {
                return;
            }
            if (!key) {
                return;
            }
            var checked = element.is(":checked");
            var value = element.val();
            if (checked) {
                SinglefinModule.Runtime.setProperty(key, data, value);
            }
            element.on("click", {
                data: data,
                key: key
            }, (event) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var inputElement = $(event.currentTarget);
                var value = inputElement.val();
                SinglefinModule.Runtime.setProperty(_key, _data, value);
            });
        }
        is(container, element, data, key) {
            if (!element.is(':radio')) {
                return;
            }
            if (!key) {
                return;
            }
            var checked = element.is(":checked");
            SinglefinModule.Runtime.setProperty(key, data, checked);
            element.on("click", {
                data: data
            }, (event) => {
                var _data = event.data.data;
                var name = element.attr("name");
                var radios = container.find('input[type="radio"][name ="' + name + '"]');
                for (var i = 0; i < radios.length; i++) {
                    var radioElement = $(radios[i]);
                    var _checked = radioElement.is(":checked");
                    var isAttributeValue = radioElement.attr("is");
                    if (isAttributeValue) {
                        SinglefinModule.Runtime.setProperty(isAttributeValue, _data, _checked);
                    }
                }
            });
        }
    }
    SinglefinModule.RadioBinding = RadioBinding;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class Request {
        constructor(config) {
            this._route = config.route;
            this._httpMethod = config.httpMethod ? config.httpMethod : "post";
            this._done = config.done;
            this._error = config.error;
            this._models = config.models ? config.models : {};
        }
        call(singlefin, page, models, parameters, pageModels) {
            return new Promise((resolve, reject) => {
                var jsonData = {};
                if (!this._models.data) {
                    jsonData = parameters;
                }
                else {
                    jsonData = SinglefinModule.Runtime.getProperty(models, this._models.data);
                }
                try {
                    var stringifyData = JSON.stringify(jsonData);
                    $.ajax({
                        type: this._httpMethod,
                        url: this._route,
                        data: stringifyData,
                        success: (response) => {
                            if (typeof response !== 'undefined' && this._models.result) {
                                SinglefinModule.Runtime.setProperty(this._models.result, models, response);
                            }
                            page.handleEvent(singlefin, page.events, this._done, page, parameters, pageModels).then(() => {
                                resolve();
                            }).catch(() => {
                                reject();
                            });
                        },
                        error: (error) => {
                            if (error && this._models.error) {
                                SinglefinModule.Runtime.setProperty(this._models.error, models, error.responseText);
                            }
                            page.handleEvent(singlefin, page.events, this._error, page, parameters, pageModels).then(() => {
                                resolve();
                            }).catch(() => {
                                reject();
                            });
                        },
                        contentType: "application/json"
                    });
                }
                catch (ex) {
                    reject(ex);
                }
            });
        }
    }
    SinglefinModule.Request = Request;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class Runtime {
        static getParentInstance(data, exp) {
            var vars = exp.split(/[.\[\]]/);
            var _data = data;
            vars = vars.filter((value) => {
                return value != "";
            });
            if (vars.length == 1) {
                return _data[vars[0]];
            }
            for (var i = 0; i < vars.length - 1; i++) {
                _data = _data[vars[i]];
            }
            return _data;
        }
        /*static setInstance(exp: string, data: any, instance: any) {
            var vars = exp.split(".");
            var _data = data;

            if(vars.length == 1) {
                this.setItem(vars[0], data, instance);

                return;
            }

            if(vars.length > 1) {
                for(var i=0; i<vars.length-2; i++) {
                    //_data = this.getItem(_data, vars[i]);
                    _data = _data[vars[i]];
                }
            
                this.setItem(vars[vars.length-2], _data, instance);

                return;
            }
        }*/
        static getProperty(data, exp) {
            var vars = exp.split(".");
            var value = data;
            for (var i = 0; i < vars.length; i++) {
                value = this.getItem(value, vars[i]);
            }
            return value;
        }
        static setProperty(exp, data, value) {
            var vars = exp.split(".");
            var _data = data;
            for (var i = 0; i < vars.length - 1; i++) {
                _data = this.getItem(_data, vars[i]);
            }
            this.setItem(vars[vars.length - 1], _data, value);
        }
        static getParentPath(exp) {
            var vars = exp.split(/[.\[]/);
            var _path = "";
            var count = 0;
            if (vars.length == 1) {
                return vars[0];
            }
            vars.map((value) => {
                var newValue = value;
                var isArrayItem = false;
                if (value.charAt(value.length - 1) === "]") {
                    newValue = "[" + value;
                    isArrayItem = true;
                }
                if (count < vars.length - 1) {
                    if (count > 0 && !isArrayItem) {
                        _path += "." + newValue;
                    }
                    else {
                        _path += newValue;
                    }
                }
                count++;
                return newValue;
            });
            return _path;
        }
        /*static hasPropertyName(data: any, exp: string) {
            var vars = exp.split(".");
            var _data = data;

            for(var i=0; i<vars.length-1; i++) {
                _data = _data[vars[i]];
            }

            return _data[vars[vars.length-1]] != undefined;
        }*/
        static getPropertyName(exp) {
            var vars = exp.split(".");
            return this.getItemName(vars[vars.length - 1]);
        }
        static getItemName(exp) {
            var res = exp.split("[");
            if (res.length === 1) {
                return res[0];
            }
            var index = res[1].substring(0, res[1].length - 1);
            return index;
        }
        static getItem(data, exp) {
            var res = exp.split("[");
            if (res.length === 1) {
                return data[res[0]];
            }
            var array = res[0];
            var index = res[1].substring(0, res[1].length - 1);
            return data[array][index];
        }
        static setItem(exp, data, instance) {
            var res = exp.split("[");
            if (res.length === 1) {
                data[res[0]] = instance;
                return;
            }
            var array = res[0];
            var index = res[1].substring(0, res[1].length - 1);
            data[array][index] = instance;
        }
    }
    SinglefinModule.Runtime = Runtime;
})(SinglefinModule || (SinglefinModule = {}));
/** UNIT TEST **/
//export default SinglefinModule.Runtime;
/** **/
/*!
 * Browser JavaScript Library v0.0.1
 * https://github.com/eagudio/browser
 *
 * Includes jquery.js
 * http://jquery.com/
 *
 * Includes require.js
 * http://requirejs.com/
 *
 * Released under the MIT license
 * https://github.com/eagudio/browser/blob/master/LICENSE
 *
 * Date: 2020-05-21T15:59Z
 */
var SinglefinModule;
(function (SinglefinModule) {
    let Singlefin = /** @class */ (() => {
        class Singlefin {
            constructor(config, homepage) {
                this._home = "__body";
                this._body = "__body";
                this._instances = [];
                this._pages = {};
                this._models = {};
                this._handlers = {};
                this._defaultLanguage = "it-IT";
                this._resources = {
                    "it-IT": {}
                };
                this.init(config, homepage);
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
            get body() {
                return this._body;
            }
            get pages() {
                return this._pages;
            }
            set models(_models) {
                this._models = _models;
            }
            get models() {
                return this._modelProxy.proxy;
            }
            get handlers() {
                return this._handlers;
            }
            get modelProxy() {
                return this._modelProxy;
            }
            getBody() {
                return this._pages[this._body];
            }
            init(config, homepage) {
                try {
                    var params = this.getUrlParams(window.location.href);
                    var configLoader = new SinglefinModule.ConfigLoader();
                    configLoader.load(config, this).then(() => {
                        this._modelProxy = new SinglefinModule.DataProxy(this._models);
                        var _homepage = config.homepage;
                        if (homepage) {
                            _homepage = homepage;
                        }
                        if (params) {
                            if (params.page) {
                                this._home = params.page;
                                _homepage = this._home;
                            }
                        }
                        return this.open(_homepage);
                    }, () => {
                        console.error("an error occurred during init singlefin: config loading error");
                    });
                }
                catch (ex) {
                    console.error("an error occurred during init singlefin: " + ex);
                }
            }
            open(pageName, parameters, models) {
                return new Promise((resolve) => {
                    var _pageName = this._body + "/" + pageName;
                    if (_pageName == this.body) {
                        return resolve(this._pages[_pageName]);
                    }
                    var page = this.pages[_pageName];
                    if (!page) {
                        console.error("an error occurred during open page '" + pageName + "': page not found");
                        return resolve();
                    }
                    page.draw(this, parameters, models).then(() => {
                        resolve(page);
                    }, (error) => {
                        console.error("an error occurred during open page '" + pageName + "'");
                        resolve();
                    });
                });
            }
            refresh(pageName, parameters, models) {
                return new Promise((resolve) => {
                    var _pageName = this._body + "/" + pageName;
                    if (_pageName == this.body) {
                        return resolve(this._pages[_pageName]);
                    }
                    var page = this.pages[_pageName];
                    if (!page) {
                        console.error("an error occurred during refresh page '" + pageName + "': page not found");
                        return resolve();
                    }
                    page.redraw(this, parameters, models).then(() => {
                        resolve(page);
                    }, (error) => {
                        console.error("an error occurred during refresh page '" + pageName + "'");
                        resolve();
                    });
                });
            }
            nextGroupStep(pageName, parameters, models) {
                return new Promise((resolve) => {
                    var _pageName = this._body + "/" + pageName;
                    if (_pageName == this.body) {
                        return resolve(this._pages[_pageName]);
                    }
                    var page = this.pages[_pageName];
                    if (!page) {
                        console.error("an error occurred during next step of page '" + pageName + "': page not found");
                        return resolve();
                    }
                    page.nextStep(this, parameters, models).then(() => {
                        resolve(page);
                    }, (error) => {
                        console.error("an error occurred during next step of page '" + pageName + "'");
                        resolve();
                    });
                });
            }
            previousGroupStep(pageName, parameters, models) {
                return new Promise((resolve) => {
                    var _pageName = this._body + "/" + pageName;
                    if (_pageName == this.body) {
                        return resolve(this._pages[_pageName]);
                    }
                    var page = this.pages[_pageName];
                    if (!page) {
                        console.error("an error occurred during next step of page '" + pageName + "': page not found");
                        return resolve();
                    }
                    page.previousStep(this, parameters, models).then(() => {
                        resolve(page);
                    }, (error) => {
                        console.error("an error occurred during next step of page '" + pageName + "'");
                        resolve();
                    });
                });
            }
            openGroupPageByIndex(pageName, index, parameters, models) {
                return new Promise((resolve) => {
                    var _pageName = this._body + "/" + pageName;
                    if (_pageName == this.body) {
                        return resolve(this._pages[_pageName]);
                    }
                    var page = this.pages[_pageName];
                    if (!page) {
                        console.error("an error occurred during next step of page '" + pageName + "': page not found");
                        return resolve();
                    }
                    page.openGroupPageByIndex(this, index, parameters, models).then(() => {
                        resolve(page);
                    }, (error) => {
                        console.error("an error occurred during next step of page '" + pageName + "'");
                        resolve();
                    });
                });
            }
            openGroupPage(pageName, pageTarget, parameters, models) {
                return new Promise((resolve) => {
                    var _pageName = this._body + "/" + pageName;
                    if (_pageName == this.body) {
                        return resolve(this._pages[_pageName]);
                    }
                    var page = this.pages[_pageName];
                    if (!page) {
                        console.error("an error occurred during next step of page '" + pageName + "': page not found");
                        return resolve();
                    }
                    var target = this.body + "/" + page.path + "/" + pageTarget;
                    page.openGroupPage(this, target, parameters, models).then(() => {
                        resolve(page);
                    }, (error) => {
                        console.error("an error occurred during next step of page '" + pageName + "'");
                        resolve();
                    });
                });
            }
            getGroupCount(pageName) {
                var _pageName = this._body + "/" + pageName;
                var page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during get group count of page '" + pageName + "': page not found");
                }
                return page.group.length;
            }
            getGroupIndex(pageName) {
                var _pageName = this._body + "/" + pageName;
                var page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during get group index of page '" + pageName + "': page not found");
                }
                return page.groupIndex;
            }
            isFirstGroupStep(pageName) {
                var _pageName = this._body + "/" + pageName;
                var page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during check first group step of page '" + pageName + "': page not found");
                }
                return page.groupIndex == 0;
            }
            isLastGroupStep(pageName) {
                var _pageName = this._body + "/" + pageName;
                var page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during check last group step of page '" + pageName + "': page not found");
                }
                return page.groupIndex == page.group.length - 1;
            }
            setNextGroupStepEnabled(pageName, enabled) {
                var _pageName = this._body + "/" + pageName;
                var page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during set next group step enabled of page '" + pageName + "': page not found");
                }
                page.setNextGroupStepEnabled(this, enabled);
            }
            isNextGroupStepEnabled(pageName) {
                var _pageName = this._body + "/" + pageName;
                var page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during check next group step enabled of page '" + pageName + "': page not found");
                }
                return page.isNextGroupStepEnabled(this);
            }
            setPreviousGroupStepEnabled(pageName, enabled) {
                var _pageName = this._body + "/" + pageName;
                var page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during set previous group step enabled of page '" + pageName + "': page not found");
                }
                page.setPreviousGroupStepEnabled(this, enabled);
            }
            isPreviousGroupStepEnabled(pageName) {
                var _pageName = this._body + "/" + pageName;
                var page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during check previous group step enabled of page '" + pageName + "': page not found");
                }
                return page.isPreviousGroupStepEnabled(this);
            }
            close(pageName, parameters) {
                return new Promise((resolve) => {
                    var _pageName = this._body + "/" + pageName;
                    var page = this.pages[_pageName];
                    if (!page) {
                        console.error("an error occured during close page: page '" + pageName + "' not found");
                        return resolve();
                    }
                    page.close(this, parameters).then(() => {
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
                    if (handlerPage.controller && handlerPage.controller[event]) {
                        handlerPage.controller[event](eventObject);
                    }
                }
            }
            static getURLPath() {
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
            addBody(name) {
                var app = new SinglefinModule.App(this);
                this._body = name;
                this._home = name;
                var body = new SinglefinModule.Page(app, name, false, "", this._body, "", null, [], [], [], [], [], "", [], null, false, [], [], null);
                this._pages[this._body] = body;
            }
            addPage(pageName, disabled, action, pagePath, container, view, controllers, replace, append, group, unwind, list, events, parameters, isWidget, styles, scripts, models, appRootPath) {
                var bodyRegexp = new RegExp("^(" + this.body + "/)");
                var pathContainer = container.replace(bodyRegexp, "");
                var app = new SinglefinModule.App(this);
                if (isWidget) {
                    var rootPath = appRootPath.replace(bodyRegexp, "");
                    app.rootPath = rootPath + "/";
                }
                var relativePath = pathContainer + "/" + pageName;
                if (pathContainer == this.body) {
                    relativePath = pageName;
                }
                this._pages[pagePath] = new SinglefinModule.Page(app, pageName, disabled, action, container, relativePath, view, controllers, replace, append, group, unwind, list, events, parameters, isWidget, styles, scripts, models);
                return this._pages[pagePath];
            }
            addSurrogate(name, path, containerPath, page) {
                var replaceChildren = this.createSurrogates(path, page.replace);
                var appendChildren = this.createSurrogates(path, page.append);
                var groupChildren = this.createSurrogates(path, page.group);
                var unwindChildren = this.createSurrogates(path, page.unwind);
                var bodyRegexp = new RegExp("^(" + this.body + "/)");
                var relativePath = path.replace(bodyRegexp, "");
                this._pages[path] = new SinglefinModule.Page(page.app, name, page.disabled, page.action, containerPath, relativePath, page.view, page.controllers, replaceChildren, appendChildren, groupChildren, unwindChildren, page.list, page.events, page.parameters, page.isWidget, page.styles, page.scripts, page.models);
                return this._pages[path];
            }
            createSurrogates(path, pagesPath) {
                var surrogates = [];
                for (var i = 0; i < pagesPath.length; i++) {
                    var page = this.pages[pagesPath[i]];
                    var pagePath = path + "/" + page.name;
                    surrogates.push(pagePath);
                    this.addSurrogate(page.name, pagePath, path, page);
                }
                return surrogates;
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
        Singlefin.moduleMap = {};
        Singlefin.loadModuleCallbacks = {};
        return Singlefin;
    })();
    SinglefinModule.Singlefin = Singlefin;
})(SinglefinModule || (SinglefinModule = {}));
window.Singlefin = window.Singlefin || SinglefinModule.Singlefin;
var SinglefinModule;
(function (SinglefinModule) {
    class Binding {
        bind(singlefin, page, element, pageData, models) {
            if (!element) {
                return;
            }
            var dataProxy = singlefin.modelProxy;
            if (!dataProxy) {
                return;
            }
            SinglefinModule.ProxyHandlerMap.registerPage(page.path);
            this.bindPageElements(singlefin, page, element, models, dataProxy.data, pageData);
        }
        bindPageElements(singlefin, page, element, models, data, pageData) {
            if (!element) {
                return;
            }
            var pageModels = page.models;
            element.each((i, item) => {
                $.each(item.attributes, (i, attribute) => {
                    if (attribute.specified) {
                        if (!attribute.name.startsWith("model-class") && attribute.name.startsWith("model")) {
                            var elementAttributeName = null;
                            if (attribute.name.startsWith("model-")) {
                                var onAttribute = attribute.name.split("model-");
                                elementAttributeName = onAttribute[1];
                            }
                            var originalValuePath = attribute.value;
                            var valuePath = originalValuePath;
                            var model = null;
                            var modelProperty = null;
                            if (pageModels) {
                                if (pageModels[originalValuePath]) {
                                    valuePath = pageModels[originalValuePath].binding;
                                    model = pageModels[originalValuePath];
                                    modelProperty = pageModels[originalValuePath].property;
                                }
                            }
                            if (models) {
                                if (models[originalValuePath]) {
                                    valuePath = models[originalValuePath].binding;
                                    model = models[originalValuePath];
                                    modelProperty = models[originalValuePath].property;
                                }
                            }
                            if (valuePath) {
                                valuePath = valuePath.replace(".$", "[" + page.index + "]");
                                var elementBinding = this.makeBinding(element, elementAttributeName, modelProperty);
                                elementBinding.watch(singlefin, page, model, valuePath, data, pageData);
                                var proxyPath = SinglefinModule.Runtime.getParentPath(valuePath);
                                var object = SinglefinModule.Runtime.getParentInstance(data, valuePath);
                                var property = SinglefinModule.Runtime.getPropertyName(valuePath);
                                var proxyHandler = SinglefinModule.ProxyHandlerMap.newProxy(proxyPath, object);
                                SinglefinModule.ProxyHandlerMap.addElementBinding(page.path, proxyPath, property, elementBinding);
                                SinglefinModule.Runtime.setProperty(proxyPath, data, proxyHandler.proxy);
                                var value = SinglefinModule.Runtime.getProperty(data, valuePath);
                                elementBinding.init(value);
                            }
                        }
                    }
                });
            });
            var children = element.children();
            children.each((i, item) => {
                this.bindPageElements(singlefin, page, $(item), models, data, pageData);
            });
        }
        makeBinding(element, attributeName, property) {
            if (element.is('input')) {
                return new SinglefinModule.InputBinding(element, attributeName, property);
            }
            else if (element.is('textarea')) {
                return new SinglefinModule.TextareaBinding(element, attributeName, property);
            }
            else if (element.is('select')) {
                return new SinglefinModule.SelectBinding(element, attributeName, property);
            }
            return new SinglefinModule.ElementBinding(element, attributeName, property);
        }
    }
    SinglefinModule.Binding = Binding;
})(SinglefinModule || (SinglefinModule = {}));
/*module SinglefinModule {
    export class Binding {
        private elementBinding: ElementBinding = new ElementBinding();
        private inputBinding: InputBinding = new InputBinding();
        private textareaBinding: TextareaBinding = new TextareaBinding();
        private checkboxBinding: CheckboxBinding = new CheckboxBinding();
        private radioBinding: RadioBinding = new RadioBinding();
        private selectBinding: SelectBinding = new SelectBinding();

        private _dataProxyHandlers: DataProxyHandler[] = [];
        

        bind(singlefin: Singlefin, page: Page, element: any, pageData: any, models: any) {
            if(!element) {
                return;
            }

            var dataProxy: DataProxy = singlefin.modelProxy;
            
            if(!dataProxy) {
                return;
            }
            
            dataProxy.addHandlers(page, this._dataProxyHandlers);
 
            this.in(singlefin, page, element, dataProxy, pageData, models);
            this.is(element, dataProxy);
            this.outClass(page, element, dataProxy);
            this.outAttribute(page, element, dataProxy, models);
        }

        in(singlefin: Singlefin, page: Page, element: any, dataProxy: DataProxy, pageData: any, models: any) {
            this.bindElements(singlefin, page, element, dataProxy, pageData, models);

            var children = element.find("[model-value]");

            for(var i=0; i<children.length; i++) {
                var child = $(children[i]);

                this.bindElements(singlefin, page, child, dataProxy, pageData, models);
            }
        }

        bindElements(singlefin: Singlefin, page: Page, element: any, dataProxy: DataProxy, pageData: any, models: any) {
            var modelKey = element.attr("model-value");
            var key = modelKey;
            var pageModels = page.models;
            var model = null;

            var hasModelValueEvent = element.attr("has-model-value-event");

            if(typeof hasModelValueEvent !== typeof undefined && hasModelValueEvent !== false) {
                return;
            }

            element.attr("has-model-value-event", "");

            if(pageModels) {
                if(pageModels[modelKey]) {
                    key = pageModels[modelKey].binding;
                    model = pageModels[modelKey];
                }
            }

            if(models) {
                if(models[modelKey]) {
                    key = models[modelKey].binding;
                    model = models[modelKey];
                }
            }

            this.elementBinding.in(element, element, dataProxy.proxy, key, pageData);
            this.inputBinding.in(singlefin, page, model, element, element, dataProxy, key);
            this.textareaBinding.in(element, element, dataProxy.proxy, key);
            this.checkboxBinding.in(element, element, dataProxy.proxy, key);
            this.radioBinding.in(element, element, dataProxy.proxy, key);
            this.selectBinding.in(element, element, dataProxy.proxy, key);
        }

        is(element: any, dataProxy: DataProxy) {
            var key = element.attr("is");

            this.elementBinding.is(element, element, dataProxy.proxy, key);
            this.inputBinding.is(element, element, dataProxy.proxy, key);
            this.textareaBinding.is(element, element, dataProxy.proxy, key);
            this.checkboxBinding.is(element, element, dataProxy.proxy, key);
            this.radioBinding.is(element, element, dataProxy.proxy, key);
            this.selectBinding.is(element, element, dataProxy.proxy, key);
            
            var children = element.find("[is]");

            for(var i=0; i<children.length; i++) {
                var child = $(children[i]);

                var key = child.attr("is");

                this.elementBinding.is(element, child, dataProxy.proxy, key);
                this.inputBinding.is(element, child, dataProxy.proxy, key);
                this.textareaBinding.is(element, child, dataProxy.proxy, key);
                this.checkboxBinding.is(element, child, dataProxy.proxy, key);
                this.radioBinding.is(element, child, dataProxy.proxy, key);
                this.selectBinding.is(element, child, dataProxy.proxy, key);
            }
        }

        outClass(page: Page, element: any, dataProxy: DataProxy) {
            var key = element.attr("model-class");
            
            this.elementBinding.outClass(this._dataProxyHandlers, page, element, element, dataProxy, key);
            
            var children = element.find("[model-class]");

            for(var i=0; i<children.length; i++) {
                var child = $(children[i]);

                var key = child.attr("model-class");

                this.elementBinding.outClass(this._dataProxyHandlers, page, element, child, dataProxy, key);
            }
        }

        outAttribute(page: Page, element: any, dataProxy: DataProxy, models: any) {
            if(!element) {
                return;
            }

            var pageModels = page.models;
            
            element.each((i: number, item: any) => {
                $.each(item.attributes, (i: number, attribute: any) => {
                    if(attribute.specified) {
                        if(!attribute.name.startsWith("model-class") && attribute.name.startsWith("model-")) {
                            var onAttribute = attribute.name.split("model-");
                            var elementAttributeName = onAttribute[1];
                            var originalValue = attribute.value;
                            var value = originalValue;

                            if(pageModels) {
                                if(pageModels[originalValue]) {
                                    value = pageModels[originalValue].binding;
                                }
                            }
                
                            if(models) {
                                if(models[originalValue]) {
                                    value = models[originalValue].binding;
                                }
                            }
                            
                            this.elementBinding.outAttribute(this._dataProxyHandlers, page, element, element, dataProxy, elementAttributeName, value);
                            this.inputBinding.outAttribute(this._dataProxyHandlers, page, element, element, dataProxy, elementAttributeName, value);
                            this.textareaBinding.outAttribute(this._dataProxyHandlers, page, element, element, dataProxy, elementAttributeName, value);
                            this.selectBinding.outAttribute(this._dataProxyHandlers, page, element, element, dataProxy, elementAttributeName, value);
                        }
                    }
                });
            });

            var children = element.children();

            children.each((i: number, item: any) => {
                this.outAttribute(page, $(item), dataProxy, models);
            });
        }
    }
}*/ 
var SinglefinModule;
(function (SinglefinModule) {
    class ElementBinding {
        constructor(htmlElement, attribute, property) {
            this._htmlElement = htmlElement;
            this._attribute = attribute;
            this._property = property;
        }
        get htmlElement() {
            return this._htmlElement;
        }
        get attribute() {
            return this._attribute;
        }
        init(value) {
            this.update(value);
        }
        watch(singlefin, page, model, valuePath, data, pageData) {
            if (this.attribute == "content") {
                return;
            }
            this.htmlElement.on("click", {
                singlefin: singlefin,
                page: page,
                data: data,
                pageData: pageData,
                valuePath: valuePath,
                model: model
            }, (event) => {
                var _singlefin = event.data.singlefin;
                var _page = event.data.page;
                var _valuePath = event.data.valuePath;
                var _model = event.data.model;
                var _data = event.data.data;
                var _pageData = event.data.pageData;
                SinglefinModule.Runtime.setProperty(_valuePath, _data, _pageData);
                if (!_model) {
                    return;
                }
                if (!_model.on) {
                    return;
                }
                _page.handleEvent(_singlefin, _model, "on", _page, _pageData, event);
            });
        }
        update(value) {
            var _value = value;
            if (this._property) {
                _value = SinglefinModule.Runtime.getProperty(value, this._property);
            }
            if (this.attribute == "value" || this.attribute == "content") {
                this.htmlElement.html(_value);
            }
            else if (this.attribute) {
                this.htmlElement.attr(this.attribute, _value);
            }
        }
    }
    SinglefinModule.ElementBinding = ElementBinding;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class InputBinding extends SinglefinModule.ElementBinding {
        init(value) {
            this.update(value);
        }
        watch(singlefin, page, model, valuePath, data, pageData) {
            this.htmlElement.on("change paste keyup", {
                singlefin: singlefin,
                page: page,
                data: data,
                valuePath: valuePath,
                model: model
            }, (event) => {
                var _singlefin = event.data.singlefin;
                var _page = event.data.page;
                var _valuePath = event.data.valuePath;
                var _model = event.data.model;
                var _data = event.data.data;
                var inputElement = $(event.currentTarget);
                var value = inputElement.val();
                SinglefinModule.Runtime.setProperty(_valuePath, _data, value);
                if (!_model) {
                    return;
                }
                if (!_model.on) {
                    return;
                }
                _page.handleEvent(_singlefin, _model, "on", _page, value, event);
            });
        }
        update(value) {
            if (this.attribute == "value") {
                this.htmlElement.val(value);
            }
            else {
                this.htmlElement.attr(this.attribute, value);
            }
        }
    }
    SinglefinModule.InputBinding = InputBinding;
})(SinglefinModule || (SinglefinModule = {}));
/*module SinglefinModule {
    export class InputBinding {

        in(singlefin: Singlefin, page: Page, model: any, container: any, element: any, dataProxy: DataProxy, key: string) {
            if(!element.is('input')) {
                return;
            }

            if(!key) {
                return;
            }

            element.on("change paste keyup", {
                page: page,
                dataProxy: dataProxy,
                key: key,
                model: model
            }, (event: any) => {
                var _page = event.data.page;
                var _dataProxy: DataProxy = event.data.dataProxy;
                var _key = event.data.key;
                var _model = event.data.model;
                var inputElement = $(event.currentTarget);
                var value = inputElement.val();
            
                Runtime.setProperty(_key, _dataProxy.data, value);
                
                if(!_model) {
                    return;
                }

                if(!_model.on) {
                    return;
                }

                page.handleEvent(singlefin, _model, "on", _page, value, event);
            });
        }

        is(container: any, element: any, data: any, key: string) {
        }

        outAttribute(dataProxyHandlers: DataProxyHandler[], page: Page, container: any, element: any, dataProxy: DataProxy, key: string, exp: string) {
            if(!element.is('input')) {
                return;
            }

            if(!key) {
                return;
            }

            if(!exp) {
                return;
            }

            var result: any = Runtime.getProperty(dataProxy.data, exp);

            if(key == "value") {
                element.val(result);
            }
            else {
                element.attr(key, result);
            }

            var dataProxyHandler: DataProxyHandler = new DataProxyHandler({
                element: element,
                key: key,
                exp: exp,
                dataProxy: dataProxy
            }, (parameters: any) => {
                try {
                    var result: any = Runtime.getProperty(parameters.dataProxy.data, exp);

                    if(parameters.key == "value") {
                        parameters.element.val(result);
                    }
                    else {
                        parameters.element.attr(parameters.key, result);
                    }
                }
                catch(ex) {
                    console.error("element attribute binding error: " + ex);
                }
            });

            dataProxyHandlers.push(dataProxyHandler);
        }
    }
}*/ 
var SinglefinModule;
(function (SinglefinModule) {
    class ListBinding extends SinglefinModule.ElementBinding {
        constructor(htmlElement, attribute, property, singlefin, page, model) {
            super(htmlElement, attribute, property);
            this._singlefin = singlefin;
            this._page = page;
            this._model = model;
        }
        init(value) {
        }
        watch(singlefin, page, model, valuePath, data, pageData) {
        }
        update(value) {
            if (!this._model) {
                return;
            }
            if (!this._model.on) {
                return;
            }
            SinglefinModule.ProxyHandlerMap.deleteProxyStartWith(this._model.from + "[");
            this._page.handleEvent(this._singlefin, this._model, "on", this._page, value, null);
        }
    }
    SinglefinModule.ListBinding = ListBinding;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class ProxyHandler {
        constructor(proxyPath, bindMaps) {
            this._disabled = false;
            this._proxyPath = proxyPath;
            this._bindMaps = bindMaps;
        }
        enable() {
            this._disabled = false;
        }
        disable() {
            this._disabled = true;
        }
        set(target, key, value, receiver) {
            target[key] = value;
            if (this._disabled) {
                return true;
            }
            for (var pagePath in this._bindMaps[key]) {
                var elementBindings = this._bindMaps[key][pagePath].binding[this._proxyPath][key];
                for (var i = 0; i < elementBindings.length; i++) {
                    elementBindings[i].update(value);
                }
            }
            return true;
        }
    }
    SinglefinModule.ProxyHandler = ProxyHandler;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    let ProxyHandlerMap = /** @class */ (() => {
        class ProxyHandlerMap {
            static newProxy(proxyPath, object, force) {
                if (!ProxyHandlerMap.hasProxy(proxyPath) || force == true) {
                    if (!ProxyHandlerMap._bindMaps[proxyPath]) {
                        ProxyHandlerMap._bindMaps[proxyPath] = {};
                    }
                    var handler = new SinglefinModule.ProxyHandler(proxyPath, ProxyHandlerMap._bindMaps[proxyPath]);
                    var proxy = new Proxy(object, handler);
                    ProxyHandlerMap._map[proxyPath] = {};
                    ProxyHandlerMap._map[proxyPath].proxy = proxy;
                    ProxyHandlerMap._map[proxyPath].handler = handler;
                }
                return ProxyHandlerMap._map[proxyPath];
            }
            static deleteProxyStartWith(proxyPath) {
                for (var key in ProxyHandlerMap._map) {
                    if (key.startsWith(proxyPath)) {
                        ProxyHandlerMap._map[key] = null;
                    }
                }
            }
            static hasProxy(proxyPath) {
                return !ProxyHandlerMap._map[proxyPath] ? false : true;
            }
            static getProxy(key) {
                return ProxyHandlerMap._map[key];
            }
            static registerPage(pagePath) {
                if (!ProxyHandlerMap._pageBindings[pagePath]) {
                    ProxyHandlerMap._pageBindings[pagePath] = {};
                }
                ProxyHandlerMap._pageBindings[pagePath].binding = {};
            }
            static addElementBinding(pagePath, proxyPath, property, elementBinding) {
                if (!ProxyHandlerMap._pageBindings[pagePath].binding[proxyPath]) {
                    ProxyHandlerMap._pageBindings[pagePath].binding[proxyPath] = {};
                }
                if (!ProxyHandlerMap._pageBindings[pagePath].binding[proxyPath][property]) {
                    ProxyHandlerMap._pageBindings[pagePath].binding[proxyPath][property] = [];
                }
                ProxyHandlerMap._pageBindings[pagePath].binding[proxyPath][property].push(elementBinding);
                if (!ProxyHandlerMap._bindMaps[proxyPath]) {
                    ProxyHandlerMap._bindMaps[proxyPath] = {};
                }
                if (!ProxyHandlerMap._bindMaps[proxyPath][property]) {
                    ProxyHandlerMap._bindMaps[proxyPath][property] = {};
                }
                if (!ProxyHandlerMap._bindMaps[proxyPath][property][pagePath]) {
                    ProxyHandlerMap._bindMaps[proxyPath][property][pagePath] = ProxyHandlerMap._pageBindings[pagePath];
                }
            }
        }
        ProxyHandlerMap._map = {};
        ProxyHandlerMap._pageBindings = {};
        ProxyHandlerMap._bindMaps = {};
        return ProxyHandlerMap;
    })();
    SinglefinModule.ProxyHandlerMap = ProxyHandlerMap;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class SelectBinding extends SinglefinModule.ElementBinding {
        init(value) {
            this.update(value);
        }
        watch(singlefin, page, model, valuePath, data, pageData) {
            this.htmlElement.on("change", {
                singlefin: singlefin,
                page: page,
                data: data,
                valuePath: valuePath,
                model: model
            }, (event) => {
                var _singlefin = event.data.singlefin;
                var _page = event.data.page;
                var _valuePath = event.data.valuePath;
                var _model = event.data.model;
                var _data = event.data.data;
                var inputElement = $(event.currentTarget);
                var value = inputElement.val();
                SinglefinModule.Runtime.setProperty(_valuePath, _data, value);
                if (!_model) {
                    return;
                }
                if (!_model.on) {
                    return;
                }
                _page.handleEvent(_singlefin, _model, "on", _page, value, event);
            });
            this.htmlElement.on("singlefin:show", {
                elementBinding: this,
                data: data,
                valuePath: valuePath
            }, (event) => {
                var value = SinglefinModule.Runtime.getProperty(event.data.data, event.data.valuePath);
                event.data.elementBinding.update(value);
            });
        }
        update(value) {
            if (this.attribute == "value") {
                this.htmlElement.val(value);
            }
            else {
                this.htmlElement.attr(this.attribute, value);
            }
        }
    }
    SinglefinModule.SelectBinding = SelectBinding;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class TextareaBinding extends SinglefinModule.ElementBinding {
        init(value) {
            this.update(value);
        }
        watch(singlefin, page, model, valuePath, data, pageData) {
            this.htmlElement.on("change paste keyup", {
                singlefin: singlefin,
                page: page,
                data: data,
                valuePath: valuePath,
                model: model
            }, (event) => {
                var _singlefin = event.data.singlefin;
                var _page = event.data.page;
                var _valuePath = event.data.valuePath;
                var _model = event.data.model;
                var _data = event.data.data;
                var inputElement = $(event.currentTarget);
                var value = inputElement.val();
                SinglefinModule.Runtime.setProperty(_valuePath, _data, value);
                if (!_model) {
                    return;
                }
                if (!_model.on) {
                    return;
                }
                _page.handleEvent(_singlefin, _model, "on", _page, value, event);
            });
        }
        update(value) {
            if (this.attribute == "value") {
                this.htmlElement.val(value);
            }
            else {
                this.htmlElement.attr(this.attribute, value);
            }
        }
    }
    SinglefinModule.TextareaBinding = TextareaBinding;
})(SinglefinModule || (SinglefinModule = {}));
//# sourceMappingURL=singlefin.js.map