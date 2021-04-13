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
            let checked = element.is(":checked");
            let value = element.val();
            if (checked) {
                SinglefinModule.Runtime.setProperty(key, data, value);
            }
            element.on("click", {
                data: data,
                key: key
            }, (event) => {
                let _data = event.data.data;
                let _key = event.data.key;
                let inputElement = $(event.currentTarget);
                let value = inputElement.val();
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
            let checked = element.is(":checked");
            SinglefinModule.Runtime.setProperty(key, data, checked);
            element.on("click", {
                data: data,
                key: key
            }, (event) => {
                let _data = event.data.data;
                let _key = event.data.key;
                let inputElement = $(event.currentTarget);
                let checked = inputElement.is(":checked");
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
            let modules = config.modules;
            let models = config.models;
            let proxies = config.proxies;
            let pages = config.pages;
            if (!pages) {
                throw "pages cannot be null or undefined";
            }
            this._bodyName = Object.keys(pages)[0];
            let module = this.getModule(this._bodyName);
            module.modules = {};
            this.processModules(module.modules, config.modules, null);
            SinglefinModule.Singlefin.modules = module.modules;
            if (models) {
                let module = this.getModule(this._bodyName);
                module.models = {};
                for (let modelKey in models) {
                    module.models[modelKey] = {};
                    let path = "['" + this._bodyName + "'].models['" + modelKey + "']";
                    module.models[modelKey] = this.unbundleJavascriptObject(path, "object", models[modelKey]);
                }
                singlefin.models = module.models;
            }
            if (proxies) {
                let module = this.getModule(this._bodyName);
                module.proxies = [];
                for (let i = 0; i < proxies.length; i++) {
                    let proxy = {};
                    proxy.events = proxies[i].events;
                    let path = "['" + this._bodyName + "'].proxies[" + i + "].proxy";
                    proxy.proxy = this.unbundleJavascriptObject(path, "object", proxies[i].proxy);
                    module.proxies.push(proxy);
                }
                singlefin.proxies = module.proxies;
            }
            singlefin.addBody(this._bodyName);
            let body = pages[this._bodyName];
            if (body.view) {
                singlefin.getBody().htmlElement = null;
            }
            singlefin.getBody().view = this.unbundleView(body.view);
            module = this.getModule(this._bodyName);
            module.controllers = [];
            module.controllers = this.unbundleJavascriptObjects("['" + this._bodyName + "'].controllers", "array", body.controllers);
            singlefin.getBody().controllers = module.controllers;
            singlefin.getBody().styles = this.unbundleFiles(body.styles);
            singlefin.getBody().scripts = this.unbundleFiles(body.scripts);
            singlefin.getBody().events = body.events;
            singlefin.getBody().models = body.models;
            this.processPages("append", singlefin.body, body.append, config.widgets, singlefin, false, singlefin.body);
            this.processPages("replace", singlefin.body, body.replace, config.widgets, singlefin, false, singlefin.body);
            this.processPages("commit", singlefin.body, body.commit, config.widgets, singlefin, false, singlefin.body);
            this.processPages("group", singlefin.body, body.group, config.widgets, singlefin, false, singlefin.body);
            return this.loadModules();
        }
        processModules(modules, modulesConfig, path) {
            if (!modulesConfig) {
                return;
            }
            for (let key in modulesConfig) {
                if (!path) {
                    path = key;
                }
                else {
                    path = path + "." + key;
                }
                if (typeof modulesConfig[key] != "string") {
                    modules[key] = {};
                    this.processModules(modules[key], modulesConfig[key], path);
                }
                else {
                    let classPath = "['" + this._bodyName + "'].modules." + path;
                    modules[key] = this.unbundleJavascriptClass(classPath, "object", modulesConfig[key]);
                }
            }
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
            for (let i = 0; i < pages.length; i++) {
                let pageName = Object.keys(pages[i])[0];
                let page = pages[i][pageName];
                page.isWidget = isWidget;
                page.appRootPath = appRootPath;
                let pagePath = containerName + "/" + pageName;
                if (page.widget) {
                    page.isWidget = true;
                    page.view = widgets[page.widget].view;
                    page.hidden = widgets[page.widget].hidden;
                    page.showed = widgets[page.widget].showed;
                    page.controllers = widgets[page.widget].controllers;
                    page.replace = widgets[page.widget].replace;
                    page.append = widgets[page.widget].append;
                    page.commit = widgets[page.widget].commit;
                    page.group = widgets[page.widget].group;
                    page.unwind = widgets[page.widget].unwind;
                    page.styles = widgets[page.widget].styles;
                    page.scripts = widgets[page.widget].scripts;
                    page.models = widgets[page.widget].models;
                    page.appRootPath = pagePath;
                }
                let replaceChildren = this.processChildrenPage(pagePath, page.replace);
                let appendChildren = this.processChildrenPage(pagePath, page.append);
                let commitChildren = this.processChildrenPage(pagePath, page.commit);
                let groupChildren = this.processChildrenPage(pagePath, page.group);
                page.view = this.unbundleView(page.view);
                let module = this.getModule(pagePath);
                module.controllers = this.unbundleJavascriptObjects("['" + pagePath + "'].controllers", "array", page.controllers);
                page.controllers = module.controllers;
                page.styles = this.unbundleFiles(page.styles);
                page.scripts = this.unbundleFiles(page.scripts);
                page.events = page.events;
                page.models = page.models;
                singlefin.addPage(pageName, page.hidden, page.showed, action, pagePath, containerName, page.view, page.controllers, replaceChildren, appendChildren, commitChildren, groupChildren, page.unwind, page.events, page.parameters, page.isWidget, page.styles, page.scripts, page.models, page.appRootPath);
                this.processPages("replace", pagePath, page.replace, widgets, singlefin, page.isWidget, page.appRootPath);
                this.processPages("append", pagePath, page.append, widgets, singlefin, page.isWidget, page.appRootPath);
                this.processPages("commit", pagePath, page.commit, widgets, singlefin, page.isWidget, page.appRootPath);
                this.processPages("group", pagePath, page.group, widgets, singlefin, page.isWidget, page.appRootPath);
            }
        }
        processChildrenPage(parentPagePath, childrenPage) {
            let children = [];
            if (!childrenPage) {
                return children;
            }
            for (let i = 0; i < childrenPage.length; i++) {
                let childPageName = Object.keys(childrenPage[i])[0];
                let childPagePath = parentPagePath + "/" + childPageName;
                children.push(childPagePath);
            }
            return children;
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
            let files = [];
            for (let i = 0; i < _files.length; i++) {
                files.push(this.decodeBase64(_files[i]));
            }
            ;
            return files;
        }
        unbundleJson(json) {
            let jsonString = this.decodeBase64(json);
            return JSON.parse(jsonString);
        }
        unbundleJavascriptObjects(path, moduleType, _objects) {
            if (!_objects) {
                return;
            }
            let objects = [];
            for (let i = 0; i < _objects.length; i++) {
                let object = this.unbundleJavascriptObject(path, moduleType, _objects[i]);
                if (object) {
                    objects.push(object);
                }
            }
            ;
            return objects;
        }
        unbundleJavascriptClass(path, moduleType, javascriptClass) {
            let code = this.decodeBase64(javascriptClass);
            if (moduleType == "array") {
                this._modulesCode += `Singlefin.moduleMap` + path + `.push(` + code + `)\n`;
            }
            else {
                this._modulesCode += `Singlefin.moduleMap` + path + ` = ` + code + `\n`;
            }
            return null;
        }
        unbundleJavascriptObject(path, moduleType, javascriptObject) {
            let code = this.decodeBase64(javascriptObject);
            if (moduleType == "array") {
                this._modulesCode += `Singlefin.moduleMap` + path + `.push(new ` + code + `())\n`;
            }
            else {
                this._modulesCode += `Singlefin.moduleMap` + path + ` = new ` + code + `()\n`;
            }
            return null;
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
        loadModules() {
            return new Promise((resolve, reject) => {
                let script = document.createElement("script");
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
    
                        for(let dataProxyHandlerKey in DataProxy._dataProxyHandlers) {
                            let dataProxyHandlers: DataProxyHandler[] = DataProxy._dataProxyHandlers[dataProxyHandlerKey];
    
                            for(let i=0; i<dataProxyHandlers.length; i++) {
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
    class Markup {
        constructor(text) {
            this._text = text;
        }
        resolve(models, refModels, pageModels, pageIndex) {
            try {
                let markupRegex = /{{(.[\s\S]*?)}}/m; //TODO: il tag singleline (s) è supportato soltanto in ES2018; da modificare se si vogliono gestire le interruzioni linea \n
                let match = markupRegex.exec(this._text);
                while (match) {
                    let isRefModelsResolved = this.resolveModelsReference(match[0], refModels, match[1], models, pageIndex);
                    let isPageModelsResolved = this.resolveModelsReference(match[0], pageModels, match[1], models, pageIndex);
                    if (!isRefModelsResolved && !isPageModelsResolved) {
                        let valuePath = match[1].replace(".$", "[" + pageIndex + "]");
                        let value = SinglefinModule.Runtime.getProperty(models, valuePath);
                        this._text = this._text.replace(match[0], value);
                    }
                    match = markupRegex.exec(this._text);
                }
                return this._text;
            }
            catch (ex) {
                console.error("resolve markup error: " + ex);
                return this._text;
            }
        }
        resolveModelsReference(text, refModels, modelPath, models, pageIndex) {
            let valuePath = modelPath.replace(".$", "[" + pageIndex + "]");
            valuePath = valuePath.trim();
            if (refModels) {
                if (refModels[valuePath]) {
                    let ref = refModels[valuePath].ref;
                    if (typeof ref !== "string") {
                        let mapPath = ref.map.replace(".$", "[" + pageIndex + "]");
                        let map = SinglefinModule.Runtime.getProperty(models, mapPath);
                        let keyPath = ref.key.replace(".$", "[" + pageIndex + "]");
                        let key = SinglefinModule.Runtime.getProperty(models, keyPath);
                        if (map[key] !== undefined) {
                            this._text = this._text.replace(text, map[key]);
                            return true;
                        }
                        else if (ref.default) {
                            let defaultValuePath = ref.default.replace(".$", "[" + pageIndex + "]");
                            let defaultValue = SinglefinModule.Runtime.getProperty(models, defaultValuePath);
                            this._text = this._text.replace(text, defaultValue);
                            return true;
                        }
                    }
                    else {
                        valuePath = ref.replace(".$", "[" + pageIndex + "]");
                        let value = SinglefinModule.Runtime.getProperty(models, valuePath);
                        this._text = this._text.replace(text, value);
                    }
                }
            }
            return false;
        }
    }
    SinglefinModule.Markup = Markup;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class Page {
        constructor(singlefin, app, name, hidden, showed, action, container, path, view, controllers, replace, append, commit, group, unwind, events, parameters, isWidget, styles, scripts, models) {
            this._index = 0;
            this._groupIndex = 0;
            this._groupNextStepEnabled = true;
            this._groupPreviousStepEnabled = true;
            this._eventManager = new SinglefinModule.EventManager();
            this._binding = new SinglefinModule.Binding();
            this._singlefin = singlefin;
            this._app = app;
            this._name = name;
            this._hidden = hidden;
            this._showed = showed;
            this._action = action;
            this._container = container;
            this._path = path;
            this._view = view;
            this._controllers = controllers,
                this._replace = replace,
                this._append = append,
                this._commit = commit,
                this._group = group,
                this._unwind = unwind,
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
        get hidden() {
            return this._hidden;
        }
        set hidden(value) {
            this._hidden = value;
        }
        get showed() {
            return this._showed;
        }
        set showed(value) {
            this._showed = value;
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
        get commit() {
            return this._commit;
        }
        set commit(value) {
            this._commit = value;
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
        get eventManager() {
            return this._eventManager;
        }
        draw(parameters, models) {
            return new Promise((resolve, reject) => {
                this.drawBody(parameters, models).then(() => {
                    this.drawContainer(this, this.container, parameters, models).then((htmlContainerElement) => {
                        this.eventManager.handleEvent(this._singlefin, this.events, "open", this, parameters, models).then((viewParameters) => {
                            this.htmlElement = this.renderView(this, viewParameters, models);
                            this.eventManager.addEventsHandlers(this._singlefin, this.app, this, this.htmlElement, viewParameters, models);
                            this.bind(this.htmlElement, viewParameters, models);
                            this.drawItems(this, viewParameters, models).then(() => {
                                this.addHtmlElement(htmlContainerElement, this);
                                this.fireShowHtmlElementEvent();
                                this.eventManager.handleEvent(this._singlefin, this.events, "show", this, viewParameters, models).then(() => {
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
        redraw(parameters, models) {
            return new Promise((resolve, reject) => {
                this.drawContainer(this, this.container, parameters, models).then((htmlContainerElement) => {
                    this.eventManager.handleEvent(this._singlefin, this.events, "refresh", this, parameters, models).then((viewParameters) => {
                        let previousPageHtmlElement = this.htmlElement;
                        this.htmlElement = this.renderView(this, viewParameters, models);
                        this.eventManager.addEventsHandlers(this._singlefin, this.app, this, this.htmlElement, viewParameters, models);
                        this.bind(this.htmlElement, viewParameters, models);
                        this.drawItems(this, viewParameters, models).then(() => {
                            previousPageHtmlElement.replaceWith(this.htmlElement);
                            this.appendStyles();
                            this.appendScripts();
                            this.fireShowHtmlElementEvent();
                            this.eventManager.handleEvent(this._singlefin, this.events, "show", this, viewParameters, models).then(() => {
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
        close(parameters, models) {
            return new Promise((resolve, reject) => {
                this.closeItems(this, parameters).then(() => {
                    this.eventManager.handleEvent(this._singlefin, this.events, "close", this, parameters, models).then((viewParameters) => {
                        if (this.action == "commit") {
                            this.htmlElement.remove();
                        }
                        resolve();
                    }).catch((ex) => {
                        console.error("close error");
                        reject("close error");
                    });
                }, (ex) => {
                    console.error("close error");
                    reject("close error");
                });
            });
        }
        getCurrentGroupPage() {
            if (!this.group) {
                return null;
            }
            let pagePath = this.group[this.groupIndex];
            return this._singlefin.pages[pagePath];
        }
        nextStep(parameters, models) {
            let currentPage = this.getCurrentGroupPage();
            this.groupIndex = this.groupIndex + 1;
            if (this.groupIndex >= this.group.length) {
                this.groupIndex = this.group.length - 1;
            }
            return new Promise((resolve, reject) => {
                this.nextController(currentPage, parameters).then(() => {
                    return this.redraw(parameters, models);
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
        previousStep(parameters, models) {
            let currentPage = this.getCurrentGroupPage();
            this.groupIndex = this.groupIndex - 1;
            if (this.groupIndex < 0) {
                this.groupIndex = 0;
            }
            return new Promise((resolve, reject) => {
                this.previousController(currentPage, parameters).then(() => {
                    return this.redraw(parameters, models);
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
            return this.redraw(parameters, models);
        }
        openGroupPage(singlefin, pageName, parameters, models) {
            let groupIndex = this.group.indexOf(pageName);
            if (groupIndex == -1) {
                console.error("group page " + pageName + " not found");
                Promise.reject("group page " + pageName + " not found");
            }
            this.groupIndex = groupIndex;
            return this.redraw(parameters, models);
        }
        setNextGroupStepEnabled(singlefin, enabled) {
            let nextPage = singlefin.pages[this.group[this.groupIndex]];
            if (!nextPage.parameters) {
                nextPage.parameters = {};
            }
            nextPage.parameters.nextEnabled = enabled;
        }
        isNextGroupStepEnabled(singlefin) {
            let nextPage = singlefin.pages[this.group[this.groupIndex]];
            if (nextPage.parameters) {
                return nextPage.parameters.nextEnabled;
            }
            return true;
        }
        setPreviousGroupStepEnabled(singlefin, enabled) {
            let previousPage = singlefin.pages[this.group[this.groupIndex]];
            if (!previousPage.parameters) {
                previousPage.parameters = {};
            }
            previousPage.parameters.previousEnabled = enabled;
        }
        isPreviousGroupStepEnabled(singlefin) {
            let previousPage = singlefin.pages[this.group[this.groupIndex]];
            if (previousPage.parameters) {
                return previousPage.parameters.previousEnabled;
            }
            return true;
        }
        drawBody(parameters, models) {
            let body = this._singlefin.getBody();
            if (body.htmlElement) {
                return Promise.resolve(body.htmlElement);
            }
            return new Promise((resolve, reject) => {
                this.eventManager.handleEvent(this._singlefin, body.events, "open", body, parameters, models).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                    body.htmlElement = $("#" + body.name);
                    body.appendStyles();
                    body.appendScripts();
                    let view = this.renderView(body, viewParameters, models);
                    body.htmlElement.append(view);
                    this.eventManager.handleEvent(this._singlefin, body.events, "show", body, viewParameters, models).then(() => {
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
        drawContainer(page, containerName, parameters, models) {
            let container = this._singlefin.pages[containerName];
            if (!container) {
                console.error("container page '" + containerName + "' not found");
                return Promise.reject("container page '" + containerName + "' not found");
            }
            if (!container.htmlElement) {
                return this.drawParent(page, containerName, parameters, models);
            }
            return Promise.resolve(container.htmlElement);
        }
        drawItems(parent, parameters, models) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this.drawChildren(parent, parent.replace, parameters, models).then(() => {
                    return this.drawChildren(parent, parent.append, parameters, models);
                }, () => {
                    console.error("replace items error");
                    reject("replace items error");
                }).then(() => {
                    return this.drawChildren(parent, parent.commit, parameters, models);
                }, () => {
                    console.error("append items error");
                    reject("append items error");
                }).then(() => {
                    return this.drawChildren(parent, parent.group, parameters, models);
                }, () => {
                    console.error("commit items error");
                    reject("commit items error");
                }).then(() => {
                    resolve();
                }, () => {
                    console.error("group items error");
                    reject("group items error");
                });
            }));
        }
        drawParent(page, pageName, parameters, models) {
            return new Promise((resolve, reject) => {
                if (pageName == this._singlefin.body) {
                    return resolve(this._singlefin.getBody().htmlElement);
                }
                let parentPage = this._singlefin.pages[pageName];
                if (!parentPage) {
                    console.error("page not found");
                    return reject("page not found");
                }
                this.drawContainer(page, parentPage.container, parameters, models).then((htmlContainerElement) => {
                    this.eventManager.handleEvent(this._singlefin, parentPage.events, "open", parentPage, parameters, models).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                        parentPage.htmlElement = this.renderView(parentPage, viewParameters, models);
                        this.eventManager.addEventsHandlers(this._singlefin, parentPage.app, parentPage, htmlContainerElement, viewParameters, models);
                        parentPage.bind(htmlContainerElement, viewParameters, models);
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
        drawChildren(parent, children, parameters, models) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!children) {
                    return resolve();
                }
                for (let i = 0; i < children.length; i++) {
                    let childPageName = children[i];
                    let childPage = this._singlefin.pages[childPageName];
                    if (childPage.action == "group") {
                        if (parent.groupIndex != i) {
                            continue;
                        }
                    }
                    if (childPage.unwind) {
                        yield this.eventManager.handleEvent(this._singlefin, childPage.events, "open", childPage, parameters, models).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                            yield this.unwindItems(parent, childPageName, childPage, viewParameters, parameters, models).then(() => __awaiter(this, void 0, void 0, function* () {
                            }), (ex) => {
                                if (ex) {
                                    console.error("draw children error");
                                    return reject("draw children error");
                                }
                            });
                        }), (ex) => {
                            if (ex) {
                                console.error("draw children error");
                                return reject("draw children error");
                            }
                        });
                    }
                    else if (childPage.action != "commit") {
                        yield this.eventManager.handleEvent(this._singlefin, childPage.events, "open", childPage, parameters, models).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                            childPage.htmlElement = this.renderView(childPage, viewParameters, models);
                            this.eventManager.addEventsHandlers(this._singlefin, childPage.app, childPage, childPage.htmlElement, viewParameters, models);
                            childPage.bind(childPage.htmlElement, viewParameters, models);
                            this.addHtmlElement(parent.htmlElement, childPage);
                            yield this.drawItems(childPage, viewParameters, models).then(() => __awaiter(this, void 0, void 0, function* () {
                                yield this.eventManager.handleEvent(this._singlefin, childPage.events, "show", childPage, viewParameters, models).then(() => {
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
                        }), (ex) => {
                            if (ex) {
                                console.error("draw children error");
                                return reject("draw children error");
                            }
                        });
                    }
                }
                resolve();
            }));
        }
        unwindItems(parent, pageName, page, parameters, controllerParameters, models) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let unwind = parameters;
                if (page.unwind && page.unwind.list) {
                    unwind = SinglefinModule.Runtime.getProperty(this._singlefin.models, page.unwind.list);
                }
                if (!Array.isArray(unwind)) {
                    console.error("unwind error page '" + pageName + "': list must to be an array");
                    return reject("unwind error page '" + pageName + "': list must to be an array");
                }
                //TODO: rimuovere i surrogati per liberare memoria e gli eventi!?
                for (let i = 0; i < unwind.length; i++) {
                    let surrogate = this._singlefin.addSurrogate(page.name + "#" + i, pageName + "/" + page.name + "#" + i, page.container, page);
                    surrogate.index = i;
                    yield this.eventManager.handleEvent(this._singlefin, surrogate.events, "unwind", surrogate, unwind[i], models).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                        surrogate.htmlElement = surrogate.renderView(surrogate, viewParameters, models);
                        this.eventManager.addEventsHandlers(this._singlefin, page.app, surrogate, surrogate.htmlElement, viewParameters, models);
                        surrogate.bind(surrogate.htmlElement, viewParameters, models);
                        yield this.drawItems(surrogate, viewParameters, models).then(() => __awaiter(this, void 0, void 0, function* () {
                            this.addHtmlElement(parent.htmlElement, surrogate);
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
                if (page.unwind && page.unwind.list) {
                    SinglefinModule.ProxyHandlerMap.registerPage(page.path);
                    let valuePath = page.unwind.list;
                    valuePath = valuePath.replace(".$", "[" + page.index + "]");
                    let elementBinding = new SinglefinModule.ListBinding(page.htmlElement, "unwind", null, this._singlefin, page, page.unwind);
                    elementBinding.watch(this._singlefin, page, null, valuePath, this._singlefin.models, parameters);
                    let proxyPath = SinglefinModule.Runtime.getParentPath(valuePath);
                    let object = SinglefinModule.Runtime.getParentInstance(this._singlefin.models, valuePath);
                    let property = SinglefinModule.Runtime.getPropertyName(valuePath);
                    let proxyHandler = SinglefinModule.ProxyHandlerMap.newProxy(proxyPath, object);
                    SinglefinModule.ProxyHandlerMap.addElementBinding(page.path, proxyPath, property, elementBinding);
                    let value = SinglefinModule.Runtime.getProperty(this._singlefin.models, valuePath);
                    SinglefinModule.Runtime.setProperty(proxyPath, this._singlefin.models, proxyHandler.proxy);
                    elementBinding.init(value);
                }
                resolve();
            }));
        }
        renderView(page, data, models) {
            if (!page.view) {
                return null;
                //return $();
            }
            let group = null;
            let currentGroupPage = page.getCurrentGroupPage();
            if (currentGroupPage) {
                group = {
                    page: currentGroupPage.name,
                    index: page.groupIndex
                };
            }
            let html = this.resolveMarkup(page.view, {
                data: data,
                parameters: page.parameters,
                models: this._singlefin.models,
                group: group
            });
            let markup = new SinglefinModule.Markup(html);
            html = markup.resolve(this._singlefin.models, models, this.models, this.index);
            let htmlElement = $(html);
            return htmlElement;
        }
        bind(htmlElement, data, models) {
            this._binding.bind(this._singlefin, this, htmlElement, data, models);
        }
        nextController(page, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!page.controllers) {
                    return resolve(parameters);
                }
                let result = parameters;
                for (let i = 0; i < page.controllers.length; i++) {
                    if (page.controllers[i].next) {
                        yield page.controllers[i].next(this._singlefin, page, result).then((_result) => __awaiter(this, void 0, void 0, function* () {
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
        previousController(page, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!page.controllers) {
                    return resolve(parameters);
                }
                let result = parameters;
                for (let i = 0; i < page.controllers.length; i++) {
                    if (page.controllers[i].previous) {
                        yield page.controllers[i].previous(this._singlefin, page, result).then((_result) => __awaiter(this, void 0, void 0, function* () {
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
                let markupRegex = /<%(.[\s\S]*?)%>/m; //TODO: il tag singleline (s) è supportato soltanto in ES2018; da modificare se si vogliono gestire le interruzioni linea \n
                let str = markup;
                let match = markupRegex.exec(str);
                while (match) {
                    let result = null;
                    let code = `(() => {
						let data = context.data;
						let parameters = context.parameters;
						let models = context.models;
						let model = context.model;
						let group = context.group;
						
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
        addHtmlElement(container, page) {
            let element = container;
            let elements = $();
            if (!element) {
                let containerPage = this._singlefin.pages[page.container];
                let parentPage = this._singlefin.pages[containerPage.container];
                element = parentPage.htmlElement;
            }
            if (page.hidden) {
                let hidden = SinglefinModule.Runtime.getProperty(this._singlefin.models, page.hidden);
                if (hidden == true) {
                    return;
                }
            }
            if (page.showed) {
                let showed = SinglefinModule.Runtime.getProperty(this._singlefin.models, page.showed);
                if (showed == false) {
                    return;
                }
            }
            page.appendStyles();
            page.appendScripts();
            let pageName = page.name.split('#')[0];
            let pageTag = element.find("page[" + pageName + "]");
            let containerPagesAttribute = element.find("[pages]");
            containerPagesAttribute.each((i, item) => {
                let pageAttributeValues = $(item).attr("pages");
                let pages = pageAttributeValues.split(',');
                if (pages.indexOf(pageName) >= 0) {
                    element = elements.add($(item));
                }
            });
            let containerPageAttribute = element.find(`[page="` + pageName + `"]`);
            if (containerPageAttribute.length > 0) {
                element = elements.add(containerPageAttribute);
            }
            if (pageTag.length > 0) {
                pageTag.before(page.htmlElement);
                pageTag.find(`[singlefin-toremove]`).remove();
                if (elements.length == 0) {
                    return;
                }
            }
            if (page.action == "replace") {
                element.html(page.htmlElement);
                let containerPage = this._singlefin.pages[page.container];
                containerPage.appendStyles();
                containerPage.appendScripts();
            }
            else if (page.action == "append") {
                element.append(page.htmlElement);
            }
            else if (page.action == "commit") {
                element.append(page.htmlElement);
            }
            else if (page.action == "group") {
                element.html(page.htmlElement);
                let containerPage = this._singlefin.pages[page.container];
                containerPage.appendStyles();
                containerPage.appendScripts();
            }
            let toHide = element.find(`[singlefin-status="hide"]`);
            if (toHide.length > 0) {
                toHide.replaceWith("<!--" + toHide.prop('outerHTML') + "-->");
            }
            let toShow = element.find(`[singlefin-status="show"]`);
            if (toShow.length > 0) {
                let html = toShow.prop('outerHTML').substring(4, toShow.prop('outerHTML').length - 3);
                toShow.attr("singlefin-status", false);
                toShow.replaceWith(html);
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
            for (let i = 0; i < this._styles.length; i++) {
                this.htmlElement.append(`<style type='text/css'>` + this._styles[i] + `</style>`);
            }
        }
        appendScripts() {
            if (!this._scripts) {
                return;
            }
            for (let i = 0; i < this._scripts.length; i++) {
                let script = document.createElement("script");
                script.type = "text/javascript";
                script.text = this._scripts[i];
                this.htmlElement.append(script);
            }
        }
        closeItems(page, parameters) {
            return new Promise((resolve, reject) => {
                if (page.group.length > 0) {
                    page.groupIndex = 0;
                }
                this.closeChildren(page.replace, parameters).then(() => {
                    return this.closeChildren(page.append, parameters);
                }, (ex) => {
                    if (ex) {
                        console.error("close items error");
                        reject("close items error");
                    }
                    else {
                        resolve();
                    }
                }).then(() => {
                    return this.closeChildren(page.commit, parameters);
                }, (ex) => {
                    if (ex) {
                        console.error("close items error");
                        reject("close items error");
                    }
                    else {
                        resolve();
                    }
                }).then(() => {
                    return this.closeChildren(page.group, parameters);
                }, (ex) => {
                    if (ex) {
                        console.error("close items error");
                        reject("close items error");
                    }
                    else {
                        resolve();
                    }
                }).then(() => {
                    resolve();
                }, (ex) => {
                    if (ex) {
                        console.error("close items error");
                        reject("close items error");
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        closeChildren(children, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!children) {
                    return resolve();
                }
                for (let i = 0; i < children.length; i++) {
                    let childName = children[i];
                    let page = this._singlefin.pages[childName];
                    if (!page) {
                        console.error("close children error: page '" + childName + "' not found");
                        return resolve();
                    }
                    yield this.closeItems(page, parameters).then(() => __awaiter(this, void 0, void 0, function* () {
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
            let checked = element.is(":checked");
            let value = element.val();
            if (checked) {
                SinglefinModule.Runtime.setProperty(key, data, value);
            }
            element.on("click", {
                data: data,
                key: key
            }, (event) => {
                let _data = event.data.data;
                let _key = event.data.key;
                let inputElement = $(event.currentTarget);
                let value = inputElement.val();
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
            let checked = element.is(":checked");
            SinglefinModule.Runtime.setProperty(key, data, checked);
            element.on("click", {
                data: data
            }, (event) => {
                let _data = event.data.data;
                let name = element.attr("name");
                let radios = container.find('input[type="radio"][name ="' + name + '"]');
                for (let i = 0; i < radios.length; i++) {
                    let radioElement = $(radios[i]);
                    let _checked = radioElement.is(":checked");
                    let isAttributeValue = radioElement.attr("is");
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
            this._config = config;
            this._route = config.route;
            this._httpMethod = config.httpMethod ? config.httpMethod : "post";
            this._models = config.models ? config.models : {};
        }
        call(singlefin, page, models, parameters, pageModels) {
            return new Promise((resolve, reject) => {
                let jsonData = {};
                if (!this._models.data) {
                    jsonData = parameters;
                }
                else {
                    jsonData = SinglefinModule.Runtime.getProperty(models, this._models.data);
                }
                this.resolveProxyRequest(singlefin, page, jsonData).then(() => {
                    this.ajaxRequest(singlefin, page, models, parameters, pageModels, jsonData).then(() => {
                        resolve();
                    }).catch((ex) => {
                        reject(ex);
                    });
                }).catch((ex) => {
                    reject(ex);
                });
            });
        }
        ajaxRequest(singlefin, page, models, parameters, pageModels, data) {
            return new Promise((resolve, reject) => {
                try {
                    let requestData = null;
                    let contentType = "application/json";
                    let processData;
                    let cache;
                    if (this._config.type == "formdata") {
                        requestData = new FormData();
                        contentType = false;
                        processData = false;
                        cache = false;
                        for (let key in data) {
                            requestData.append(key, data[key]);
                        }
                    }
                    else {
                        requestData = JSON.stringify(data);
                    }
                    $.ajax({
                        type: this._httpMethod,
                        url: this._route,
                        data: requestData,
                        processData: processData,
                        contentType: contentType,
                        cache: cache,
                        success: (response) => __awaiter(this, void 0, void 0, function* () {
                            this.resolveProxyResponse(singlefin, page, response).then(() => {
                                if (typeof response !== 'undefined' && this._models.result) {
                                    SinglefinModule.Runtime.setProperty(this._models.result, models, response);
                                }
                                page.eventManager.handleEvent(singlefin, this._config, "resolved", page, parameters, null).then(() => {
                                    resolve();
                                }).catch(() => {
                                    reject();
                                });
                            }).catch((ex) => {
                                reject(ex);
                            });
                        }),
                        error: (error) => __awaiter(this, void 0, void 0, function* () {
                            this.resolveProxyResponse(singlefin, page, error.responseText).then(() => {
                                if (error && this._models.error) {
                                    SinglefinModule.Runtime.setProperty(this._models.error, models, error.responseText);
                                }
                                page.eventManager.handleEvent(singlefin, this._config, "rejected", page, parameters, null).then(() => {
                                    resolve();
                                }).catch(() => {
                                    reject();
                                });
                            }).catch((ex) => {
                                reject(ex);
                            });
                        })
                    });
                }
                catch (ex) {
                    reject(ex);
                }
            });
        }
        resolveProxyRequest(singlefin, page, data) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (singlefin.proxies.length == 0) {
                    return resolve(data);
                }
                for (let i = 0; i < singlefin.proxies.length; i++) {
                    let rejected = false;
                    yield singlefin.proxies[i].proxy.request(page.app, page, singlefin.models, data).then((event) => __awaiter(this, void 0, void 0, function* () {
                        yield page.eventManager.handleEvent(singlefin, singlefin.proxies[i].events, event, page, data, null).then(() => {
                        }).catch((ex) => {
                            return reject(ex);
                        });
                    })).catch((event) => __awaiter(this, void 0, void 0, function* () {
                        rejected = true;
                        yield page.eventManager.handleEvent(singlefin, singlefin.proxies[i].events, event, page, data, null).then(() => {
                        }).catch((ex) => {
                            return reject(ex);
                        });
                    }));
                    if (rejected) {
                        return;
                    }
                }
                return resolve();
            }));
        }
        resolveProxyResponse(singlefin, page, data) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (singlefin.proxies.length == 0) {
                    return resolve(data);
                }
                for (let i = 0; i < singlefin.proxies.length; i++) {
                    let rejected = false;
                    yield singlefin.proxies[i].proxy.response(page.app, page, singlefin.models, data).then((event) => __awaiter(this, void 0, void 0, function* () {
                        yield page.eventManager.handleEvent(singlefin, singlefin.proxies[i].events, event, page, data, null).then(() => {
                        }).catch((ex) => {
                            return reject(ex);
                        });
                    })).catch((event) => __awaiter(this, void 0, void 0, function* () {
                        rejected = true;
                        yield page.eventManager.handleEvent(singlefin, singlefin.proxies[i].events, event, page, data, null).then(() => {
                        }).catch((ex) => {
                            return reject(ex);
                        });
                    }));
                    if (rejected) {
                        return;
                    }
                }
                return resolve();
            }));
        }
    }
    SinglefinModule.Request = Request;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class Runtime {
        static getParentInstance(data, exp) {
            let vars = exp.split(/[.\[\]]/);
            let _data = data;
            vars = vars.filter((value) => {
                return value != "";
            });
            if (vars.length == 1) {
                return _data[vars[0]];
            }
            for (let i = 0; i < vars.length - 1; i++) {
                _data = _data[vars[i]];
            }
            return _data;
        }
        /*static setInstance(exp: string, data: any, instance: any) {
            let vars = exp.split(".");
            let _data = data;

            if(vars.length == 1) {
                this.setItem(vars[0], data, instance);

                return;
            }

            if(vars.length > 1) {
                for(let i=0; i<vars.length-2; i++) {
                    //_data = this.getItem(_data, vars[i]);
                    _data = _data[vars[i]];
                }
            
                this.setItem(vars[vars.length-2], _data, instance);

                return;
            }
        }*/
        static getProperty(data, exp) {
            let vars = exp.split(".");
            let value = data;
            for (let i = 0; i < vars.length; i++) {
                value = this.getItem(value, vars[i]);
            }
            return value;
        }
        static setProperty(exp, data, value) {
            let vars = exp.split(".");
            let _data = data;
            for (let i = 0; i < vars.length - 1; i++) {
                _data = this.getItem(_data, vars[i]);
            }
            this.setItem(vars[vars.length - 1], _data, value);
        }
        static getParentPath(exp) {
            let vars = exp.split(/[.\[]/);
            let _path = "";
            let count = 0;
            if (vars.length == 1) {
                return vars[0];
            }
            vars.map((value) => {
                let newValue = value;
                let isArrayItem = false;
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
            let vars = exp.split(".");
            let _data = data;

            for(let i=0; i<vars.length-1; i++) {
                _data = _data[vars[i]];
            }

            return _data[vars[vars.length-1]] != undefined;
        }*/
        static getPropertyName(exp) {
            let vars = exp.split(".");
            return this.getItemName(vars[vars.length - 1]);
        }
        static getItemName(exp) {
            let res = exp.split("[");
            if (res.length === 1) {
                return res[0];
            }
            let index = res[1].substring(0, res[1].length - 1);
            return index;
        }
        static getItem(data, exp) {
            let res = exp.split("[");
            if (res.length === 1) {
                return data[res[0]];
            }
            let array = res[0];
            let index = res[1].substring(0, res[1].length - 1);
            return data[array][index];
        }
        static setItem(exp, data, instance) {
            let res = exp.split("[");
            if (res.length === 1) {
                data[res[0]] = instance;
                return;
            }
            let array = res[0];
            let index = res[1].substring(0, res[1].length - 1);
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
                this._proxies = [];
                this._handlers = {};
                this.init(config, homepage);
            }
            get instances() {
                return this._instances;
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
                return this._models;
            }
            set proxies(_proxies) {
                this._proxies = _proxies;
            }
            get proxies() {
                return this._proxies;
            }
            get handlers() {
                return this._handlers;
            }
            getBody() {
                return this._pages[this._body];
            }
            init(config, homepage) {
                try {
                    let params = this.getUrlParams(window.location.href);
                    let configLoader = new SinglefinModule.ConfigLoader();
                    configLoader.load(config, this).then(() => {
                        let _homepage = config.homepage;
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
                    let _pageName = this._body + "/" + pageName;
                    if (_pageName == this.body) {
                        return resolve(this._pages[_pageName]);
                    }
                    let page = this.pages[_pageName];
                    if (!page) {
                        console.error("an error occurred during open page '" + pageName + "': page not found");
                        return resolve();
                    }
                    page.draw(parameters, models).then(() => {
                        resolve();
                    }, (error) => {
                        console.error("an error occurred during open page '" + pageName + "'");
                        resolve();
                    });
                });
            }
            refresh(pageName, parameters, models) {
                return new Promise((resolve) => {
                    let _pageName = this._body + "/" + pageName;
                    if (_pageName == this.body) {
                        return resolve(this._pages[_pageName]);
                    }
                    let page = this.pages[_pageName];
                    if (!page) {
                        console.error("an error occurred during refresh page '" + pageName + "': page not found");
                        return resolve();
                    }
                    page.redraw(parameters, models).then(() => {
                        resolve();
                    }, (error) => {
                        console.error("an error occurred during refresh page '" + pageName + "'");
                        resolve();
                    });
                });
            }
            nextGroupStep(pageName, parameters, models) {
                return new Promise((resolve) => {
                    let _pageName = this._body + "/" + pageName;
                    if (_pageName == this.body) {
                        return resolve(this._pages[_pageName]);
                    }
                    let page = this.pages[_pageName];
                    if (!page) {
                        console.error("an error occurred during next step of page '" + pageName + "': page not found");
                        return resolve();
                    }
                    page.nextStep(parameters, models).then(() => {
                        resolve();
                    }, (error) => {
                        console.error("an error occurred during next step of page '" + pageName + "'");
                        resolve();
                    });
                });
            }
            previousGroupStep(pageName, parameters, models) {
                return new Promise((resolve) => {
                    let _pageName = this._body + "/" + pageName;
                    if (_pageName == this.body) {
                        return resolve(this._pages[_pageName]);
                    }
                    let page = this.pages[_pageName];
                    if (!page) {
                        console.error("an error occurred during previous step of page '" + pageName + "': page not found");
                        return resolve();
                    }
                    page.previousStep(parameters, models).then(() => {
                        resolve();
                    }, (error) => {
                        console.error("an error occurred during previous step of page '" + pageName + "'");
                        resolve();
                    });
                });
            }
            openGroupPageByIndex(pageName, index, parameters, models) {
                return new Promise((resolve) => {
                    let _pageName = this._body + "/" + pageName;
                    if (_pageName == this.body) {
                        return resolve(this._pages[_pageName]);
                    }
                    let page = this.pages[_pageName];
                    if (!page) {
                        console.error("an error occurred during open group page by index '" + pageName + "': page not found");
                        return resolve();
                    }
                    page.openGroupPageByIndex(this, index, parameters, models).then(() => {
                        resolve();
                    }, (error) => {
                        console.error("an error occurred during open group page by index '" + pageName + "'");
                        resolve();
                    });
                });
            }
            openGroupPage(pageName, pageTarget, parameters, models) {
                return new Promise((resolve) => {
                    let _pageName = this._body + "/" + pageName;
                    if (_pageName == this.body) {
                        return resolve(this._pages[_pageName]);
                    }
                    let page = this.pages[_pageName];
                    if (!page) {
                        console.error("an error occurred during open group page '" + pageName + "': page not found");
                        return resolve();
                    }
                    let target = this.body + "/" + page.path + "/" + pageTarget;
                    page.openGroupPage(this, target, parameters, models).then(() => {
                        resolve();
                    }, (error) => {
                        console.error("an error occurred during open group page '" + pageName + "'");
                        resolve();
                    });
                });
            }
            resetGroupPage(pageName) {
                let _pageName = this._body + "/" + pageName;
                if (_pageName == this.body) {
                    return;
                }
                let page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during reset group page '" + pageName + "': page not found");
                }
                page.groupIndex = 0;
            }
            getGroupCount(pageName) {
                let _pageName = this._body + "/" + pageName;
                let page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during get group count of page '" + pageName + "': page not found");
                }
                return page.group.length;
            }
            getGroupIndex(pageName) {
                let _pageName = this._body + "/" + pageName;
                let page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during get group index of page '" + pageName + "': page not found");
                }
                return page.groupIndex;
            }
            isFirstGroupStep(pageName) {
                let _pageName = this._body + "/" + pageName;
                let page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during check first group step of page '" + pageName + "': page not found");
                }
                return page.groupIndex == 0;
            }
            isLastGroupStep(pageName) {
                let _pageName = this._body + "/" + pageName;
                let page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during check last group step of page '" + pageName + "': page not found");
                }
                return page.groupIndex == page.group.length - 1;
            }
            setNextGroupStepEnabled(pageName, enabled) {
                let _pageName = this._body + "/" + pageName;
                let page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during set next group step enabled of page '" + pageName + "': page not found");
                }
                page.setNextGroupStepEnabled(this, enabled);
            }
            isNextGroupStepEnabled(pageName) {
                let _pageName = this._body + "/" + pageName;
                let page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during check next group step enabled of page '" + pageName + "': page not found");
                }
                return page.isNextGroupStepEnabled(this);
            }
            setPreviousGroupStepEnabled(pageName, enabled) {
                let _pageName = this._body + "/" + pageName;
                let page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during set previous group step enabled of page '" + pageName + "': page not found");
                }
                page.setPreviousGroupStepEnabled(this, enabled);
            }
            isPreviousGroupStepEnabled(pageName) {
                let _pageName = this._body + "/" + pageName;
                let page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during check previous group step enabled of page '" + pageName + "': page not found");
                }
                return page.isPreviousGroupStepEnabled(this);
            }
            close(pageName, parameters, models) {
                return new Promise((resolve) => {
                    let _pageName = this._body + "/" + pageName;
                    let page = this.pages[_pageName];
                    if (!page) {
                        console.error("an error occured during close page: page '" + pageName + "' not found");
                        return resolve();
                    }
                    page.close(parameters, models).then(() => {
                        resolve();
                    }, (error) => {
                        console.error("an error occurred during close page '" + pageName + "'");
                        resolve();
                    });
                });
            }
            trigger(event, data) {
                let paths = [];
                if (this._handlers[event]) {
                    paths = this._handlers[event];
                }
                for (let h = 0; h < paths.length; h++) {
                    let handlerPage = this.pages[paths[h]];
                    let eventObject = {
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
                let path = window.location.href;
                let paths = path.split("/");
                if (paths.length > 2) {
                    let basePath = "/";
                    for (let i = 3; i < paths.length; i++) {
                        let qualifyPaths = paths[i].split("?");
                        basePath += qualifyPaths[0];
                    }
                    return basePath;
                }
                return "/";
            }
            addBody(name) {
                let app = new SinglefinModule.App(this);
                this._body = name;
                this._home = name;
                let body = new SinglefinModule.Page(this, app, name, null, null, "", this._body, "", null, [], [], [], [], [], "", [], null, false, [], [], null);
                this._pages[this._body] = body;
            }
            addPage(pageName, hidden, showed, action, pagePath, container, view, controllers, replace, append, commit, group, unwind, events, parameters, isWidget, styles, scripts, models, appRootPath) {
                let bodyRegexp = new RegExp("^(" + this.body + "/)");
                let pathContainer = container.replace(bodyRegexp, "");
                let app = new SinglefinModule.App(this);
                if (isWidget) {
                    let rootPath = appRootPath.replace(bodyRegexp, "");
                    app.rootPath = rootPath + "/";
                }
                let relativePath = pathContainer + "/" + pageName;
                if (pathContainer == this.body) {
                    relativePath = pageName;
                }
                this._pages[pagePath] = new SinglefinModule.Page(this, app, pageName, hidden, showed, action, container, relativePath, view, controllers, replace, append, commit, group, unwind, events, parameters, isWidget, styles, scripts, models);
                return this._pages[pagePath];
            }
            addSurrogate(name, path, containerPath, page) {
                let replaceChildren = this.createSurrogates(path, page.replace);
                let appendChildren = this.createSurrogates(path, page.append);
                let commitChildren = this.createSurrogates(path, page.commit);
                let groupChildren = this.createSurrogates(path, page.group);
                let bodyRegexp = new RegExp("^(" + this.body + "/)");
                let relativePath = path.replace(bodyRegexp, "");
                this._pages[path] = new SinglefinModule.Page(this, page.app, name, page.hidden, page.showed, page.action, containerPath, relativePath, page.view, page.controllers, replaceChildren, appendChildren, commitChildren, groupChildren, page.unwind, page.events, page.parameters, page.isWidget, page.styles, page.scripts, page.models);
                return this._pages[path];
            }
            createSurrogates(path, pagesPath) {
                let surrogates = [];
                for (let i = 0; i < pagesPath.length; i++) {
                    let page = this.pages[pagesPath[i]];
                    let pagePath = path + "/" + page.name;
                    surrogates.push(pagePath);
                    this.addSurrogate(page.name, pagePath, path, page);
                }
                return surrogates;
            }
            getUrlParams(url) {
                let queryString = url.split("?");
                let query = "";
                if (queryString.length < 2) {
                    return null;
                }
                query = queryString[1];
                let vars = query.split("&");
                let queryObject = {};
                for (let i = 0; i < vars.length; i++) {
                    let pair = vars[i].split("=");
                    let key = decodeURIComponent(pair[0]);
                    let value = decodeURIComponent(pair[1]);
                    if (typeof queryObject[key] === "undefined") {
                        queryObject[key] = decodeURIComponent(value);
                    }
                    else if (typeof queryObject[key] === "string") {
                        let arr = [queryObject[key], decodeURIComponent(value)];
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
        Singlefin.modules = {};
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
            SinglefinModule.ProxyHandlerMap.registerPage(page.path);
            this.bindPageElements(singlefin, page, element, models, pageData);
        }
        bindPageElements(singlefin, page, element, models, pageData) {
            if (!element) {
                return;
            }
            let pageModels = page.models;
            element.each((i, item) => {
                $.each(item.attributes, (i, attribute) => {
                    if (attribute.specified) {
                        if (!attribute.name.startsWith("model-class") && attribute.name.startsWith("model")) {
                            let elementAttributeName = null;
                            if (attribute.name.startsWith("model-")) {
                                let onAttribute = attribute.name.split("model-");
                                elementAttributeName = onAttribute[1];
                            }
                            let originalValuePath = attribute.value;
                            let valuePath = originalValuePath;
                            let model = null;
                            let modelProperty = null;
                            if (pageModels) {
                                if (pageModels[originalValuePath]) {
                                    valuePath = pageModels[originalValuePath].ref;
                                    model = pageModels[originalValuePath];
                                    modelProperty = pageModels[originalValuePath].property;
                                }
                            }
                            if (models) {
                                if (models[originalValuePath]) {
                                    valuePath = models[originalValuePath].ref;
                                    model = models[originalValuePath];
                                    modelProperty = models[originalValuePath].property;
                                }
                            }
                            if (valuePath) {
                                valuePath = valuePath.replace(".$", "[" + page.index + "]");
                                let elementBinding = this.makeBinding($(item), elementAttributeName, modelProperty);
                                elementBinding.watch(singlefin, page, model, valuePath, singlefin.models, pageData);
                                let proxyPath = SinglefinModule.Runtime.getParentPath(valuePath);
                                let object = SinglefinModule.Runtime.getParentInstance(singlefin.models, valuePath);
                                let property = SinglefinModule.Runtime.getPropertyName(valuePath);
                                let proxyHandler = SinglefinModule.ProxyHandlerMap.newProxy(proxyPath, object);
                                SinglefinModule.ProxyHandlerMap.addElementBinding(page.path, proxyPath, property, elementBinding);
                                let value = SinglefinModule.Runtime.getProperty(singlefin.models, valuePath);
                                SinglefinModule.Runtime.setProperty(proxyPath, singlefin.models, proxyHandler.proxy);
                                elementBinding.init(value);
                            }
                        }
                    }
                });
            });
            let children = element.children();
            children.each((i, item) => {
                this.bindPageElements(singlefin, page, $(item), models, pageData);
            });
        }
        makeBinding(element, attributeName, property) {
            if (element.is('input')) {
                if (element.attr("type") == "file") {
                    return new SinglefinModule.InputFileBinding(element, attributeName, property);
                }
                else {
                    return new SinglefinModule.InputBinding(element, attributeName, property);
                }
            }
            else if (element.is('textarea')) {
                return new SinglefinModule.TextareaBinding(element, attributeName, property);
            }
            else if (element.is('select')) {
                return new SinglefinModule.SelectBinding(element, attributeName, property);
            }
            else if (attributeName == "hide") {
                return new SinglefinModule.HideBinding(element, attributeName, property);
            }
            else if (attributeName == "show") {
                return new SinglefinModule.ShowBinding(element, attributeName, property);
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

            let dataProxy: DataProxy = singlefin.modelProxy;
            
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

            let children = element.find("[model-value]");

            for(let i=0; i<children.length; i++) {
                let child = $(children[i]);

                this.bindElements(singlefin, page, child, dataProxy, pageData, models);
            }
        }

        bindElements(singlefin: Singlefin, page: Page, element: any, dataProxy: DataProxy, pageData: any, models: any) {
            let modelKey = element.attr("model-value");
            let key = modelKey;
            let pageModels = page.models;
            let model = null;

            let hasModelValueEvent = element.attr("has-model-value-event");

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
            let key = element.attr("is");

            this.elementBinding.is(element, element, dataProxy.proxy, key);
            this.inputBinding.is(element, element, dataProxy.proxy, key);
            this.textareaBinding.is(element, element, dataProxy.proxy, key);
            this.checkboxBinding.is(element, element, dataProxy.proxy, key);
            this.radioBinding.is(element, element, dataProxy.proxy, key);
            this.selectBinding.is(element, element, dataProxy.proxy, key);
            
            let children = element.find("[is]");

            for(let i=0; i<children.length; i++) {
                let child = $(children[i]);

                let key = child.attr("is");

                this.elementBinding.is(element, child, dataProxy.proxy, key);
                this.inputBinding.is(element, child, dataProxy.proxy, key);
                this.textareaBinding.is(element, child, dataProxy.proxy, key);
                this.checkboxBinding.is(element, child, dataProxy.proxy, key);
                this.radioBinding.is(element, child, dataProxy.proxy, key);
                this.selectBinding.is(element, child, dataProxy.proxy, key);
            }
        }

        outClass(page: Page, element: any, dataProxy: DataProxy) {
            let key = element.attr("model-class");
            
            this.elementBinding.outClass(this._dataProxyHandlers, page, element, element, dataProxy, key);
            
            let children = element.find("[model-class]");

            for(let i=0; i<children.length; i++) {
                let child = $(children[i]);

                let key = child.attr("model-class");

                this.elementBinding.outClass(this._dataProxyHandlers, page, element, child, dataProxy, key);
            }
        }

        outAttribute(page: Page, element: any, dataProxy: DataProxy, models: any) {
            if(!element) {
                return;
            }

            let pageModels = page.models;
            
            element.each((i: number, item: any) => {
                $.each(item.attributes, (i: number, attribute: any) => {
                    if(attribute.specified) {
                        if(!attribute.name.startsWith("model-class") && attribute.name.startsWith("model-")) {
                            let onAttribute = attribute.name.split("model-");
                            let elementAttributeName = onAttribute[1];
                            let originalValue = attribute.value;
                            let value = originalValue;

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

            let children = element.children();

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
        set htmlElement(value) {
            this._htmlElement = value;
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
        }
        update(value) {
            let _value = value;
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
    class HideBinding extends SinglefinModule.ElementBinding {
        init(value) {
            this.update(value);
        }
        watch(singlefin, page, model, valuePath, data, pageData) {
        }
        update(value) {
            this.htmlElement.attr("hidden", value);
        }
    }
    SinglefinModule.HideBinding = HideBinding;
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
                let _singlefin = event.data.singlefin;
                let _page = event.data.page;
                let _valuePath = event.data.valuePath;
                let _model = event.data.model;
                let _data = event.data.data;
                let inputElement = $(event.currentTarget);
                let value = inputElement.val();
                SinglefinModule.Runtime.setProperty(_valuePath, _data, value);
                if (!_model) {
                    return;
                }
                if (!_model.on) {
                    return;
                }
                _page.eventManager.handleEvent(_singlefin, _model, "on", _page, value, event);
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
var SinglefinModule;
(function (SinglefinModule) {
    class InputFileBinding extends SinglefinModule.ElementBinding {
        init(value) {
        }
        watch(singlefin, page, model, valuePath, data, pageData) {
            this.htmlElement.on("change", {
                singlefin: singlefin,
                page: page,
                data: data,
                valuePath: valuePath,
                model: model
            }, (event) => {
                let _singlefin = event.data.singlefin;
                let _page = event.data.page;
                let _valuePath = event.data.valuePath;
                let _model = event.data.model;
                let _data = event.data.data;
                let inputElement = event.currentTarget;
                if (inputElement.files && inputElement.files[0]) {
                    SinglefinModule.Runtime.setProperty(_valuePath, _data, inputElement.files[0]);
                    if (!_model) {
                        return;
                    }
                    if (!_model.on) {
                        return;
                    }
                    _page.eventManager.handleEvent(_singlefin, _model, "on", _page, inputElement.files[0], event);
                }
            });
        }
        update(value) {
        }
    }
    SinglefinModule.InputFileBinding = InputFileBinding;
})(SinglefinModule || (SinglefinModule = {}));
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
            if (!this._model) {
                return;
            }
            SinglefinModule.ProxyHandlerMap.deleteProxyStartWith(this._model.list + "[");
        }
        watch(singlefin, page, model, valuePath, data, pageData) {
        }
        update(value) {
            if (!this._model) {
                return;
            }
            SinglefinModule.ProxyHandlerMap.deleteProxyStartWith(this._model.list + "[");
            if (!this._model.on) {
                return;
            }
            this._page.eventManager.handleEvent(this._singlefin, this._model, "on", this._page, value, null);
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
            for (let pagePath in this._bindMaps[key]) {
                let elementBindings = this._bindMaps[key][pagePath].binding[this._proxyPath][key];
                for (let i = 0; i < elementBindings.length; i++) {
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
                    let handler = new SinglefinModule.ProxyHandler(proxyPath, ProxyHandlerMap._bindMaps[proxyPath]);
                    let proxy = new Proxy(object, handler);
                    ProxyHandlerMap._map[proxyPath] = {};
                    ProxyHandlerMap._map[proxyPath].proxy = proxy;
                    ProxyHandlerMap._map[proxyPath].handler = handler;
                }
                return ProxyHandlerMap._map[proxyPath];
            }
            static deleteProxyStartWith(proxyPath) {
                for (let key in ProxyHandlerMap._map) {
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
                let _singlefin = event.data.singlefin;
                let _page = event.data.page;
                let _valuePath = event.data.valuePath;
                let _model = event.data.model;
                let _data = event.data.data;
                let inputElement = $(event.currentTarget);
                let value = inputElement.val();
                if (value === "null") {
                    value = null;
                }
                SinglefinModule.Runtime.setProperty(_valuePath, _data, value);
                if (!_model) {
                    return;
                }
                if (!_model.on) {
                    return;
                }
                _page.eventManager.handleEvent(_singlefin, _model, "on", _page, value, event);
            });
            this.htmlElement.on("singlefin:show", {
                elementBinding: this,
                data: data,
                valuePath: valuePath
            }, (event) => {
                let value = SinglefinModule.Runtime.getProperty(event.data.data, event.data.valuePath);
                event.data.elementBinding.update(value);
            });
        }
        update(value) {
            if (this.attribute == "value") {
                this.htmlElement.val(String(value));
            }
            else {
                this.htmlElement.attr(this.attribute, String(value));
            }
        }
    }
    SinglefinModule.SelectBinding = SelectBinding;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class ShowBinding extends SinglefinModule.ElementBinding {
        init(value) {
            this.update(value);
        }
        watch(singlefin, page, model, valuePath, data, pageData) {
        }
        update(value) {
            this.htmlElement.attr("hidden", !value);
        }
    }
    SinglefinModule.ShowBinding = ShowBinding;
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
                let _singlefin = event.data.singlefin;
                let _page = event.data.page;
                let _valuePath = event.data.valuePath;
                let _model = event.data.model;
                let _data = event.data.data;
                let inputElement = $(event.currentTarget);
                let value = inputElement.val();
                SinglefinModule.Runtime.setProperty(_valuePath, _data, value);
                if (!_model) {
                    return;
                }
                if (!_model.on) {
                    return;
                }
                _page.eventManager.handleEvent(_singlefin, _model, "on", _page, value, event);
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
var SinglefinModule;
(function (SinglefinModule) {
    class EventHandler {
        constructor(eventManager) {
            this.eventManager = eventManager;
        }
    }
    SinglefinModule.EventHandler = EventHandler;
})(SinglefinModule || (SinglefinModule = {}));
/// <reference path="eventhandler.ts"/>
var SinglefinModule;
(function (SinglefinModule) {
    class BrowserEventHandler extends SinglefinModule.EventHandler {
        handle(singlefin, delegate, page, parameters, pageModels, event) {
            if (delegate.browser == "refresh") {
                window.location.reload();
            }
            return Promise.resolve();
        }
    }
    SinglefinModule.BrowserEventHandler = BrowserEventHandler;
})(SinglefinModule || (SinglefinModule = {}));
/// <reference path="eventhandler.ts"/>
var SinglefinModule;
(function (SinglefinModule) {
    class ControllerEventHandler extends SinglefinModule.EventHandler {
        handle(singlefin, delegate, page, parameters, pageModels, event) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let result = parameters;
                for (let i = 0; i < page.controllers.length; i++) {
                    let controller = page.controllers[i];
                    let controllerMethod = controller[delegate.controller];
                    if (controllerMethod) {
                        let promise = controllerMethod.call(controller, page.app, page, singlefin.models, parameters, event);
                        if (promise) {
                            yield promise.then((_result) => {
                                result = _result;
                            }, (ex) => {
                                console.error("page '" + page.name + "' handle controller error: " + ex);
                                return reject(ex);
                            });
                        }
                    }
                }
                resolve(result);
            }));
        }
    }
    SinglefinModule.ControllerEventHandler = ControllerEventHandler;
})(SinglefinModule || (SinglefinModule = {}));
/// <reference path="eventhandler.ts"/>
var SinglefinModule;
(function (SinglefinModule) {
    class DelegateEventHandler extends SinglefinModule.EventHandler {
        handle(singlefin, delegate, page, parameters, pageModels, event) {
            return new Promise((resolve, reject) => {
                if (delegate.event.preventDefault == true) {
                    event.preventDefault();
                    if (!delegate.event.delegate) {
                        return resolve();
                    }
                }
                if (!delegate.event.delegate) {
                    return reject("method '" + delegate.event + "' not supported");
                }
                this.eventManager.handleEvent(singlefin, page.events, delegate.event.delegate, page, parameters, pageModels).then(() => {
                    return resolve();
                }).catch((ex) => {
                    return reject(ex);
                });
            });
        }
    }
    SinglefinModule.DelegateEventHandler = DelegateEventHandler;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class EventManager {
        addEventsHandlers(singlefin, app, page, element, parameters, pageModels) {
            if (!element) {
                return;
            }
            element.each((i, item) => {
                $.each(item.attributes, (i, attribute) => {
                    if (attribute.specified) {
                        if (attribute.name.startsWith("on-")) {
                            let onAttribute = attribute.name.split("on-");
                            let event = onAttribute[1];
                            let handlerList = [];
                            if (attribute.value) {
                                handlerList = attribute.value.split(",");
                            }
                            for (let n = 0; n < handlerList.length; n++) {
                                let handler = handlerList[n];
                                let paths = [];
                                if (singlefin.handlers[handler]) {
                                    paths = singlefin.handlers[handler];
                                }
                                this.addHandleEvent(singlefin, element, event, handler, page, parameters, pageModels);
                            }
                        }
                        if (attribute.name == "href") {
                            if (attribute.value.startsWith("page#")) {
                                let href = attribute.value;
                                let markup = href.split("#");
                                if (markup.length > 0) {
                                    let path = markup[1];
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
            let children = element.children();
            children.each((i, item) => {
                this.addEventsHandlers(singlefin, app, page, $(item), parameters, pageModels);
            });
        }
        addHandleEvent(singlefin, htmlElement, eventType, event, page, parameters, pageModels) {
            if (!page.events) {
                return;
            }
            let events = page.events[event];
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
                let eventData = event.data;
                let _page = eventData.page;
                _page.eventManager.handleEvent(singlefin, eventData.page.events, eventData.event, eventData.page, eventData.data, eventData.pageModels, event);
            });
        }
        handleEvent(singlefin, events, event, page, parameters, pageModels, eventObject) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let result = parameters;
                if (!events) {
                    return resolve(result);
                }
                let eventsList = events[event];
                if (!eventsList) {
                    return resolve(result);
                }
                for (let i = 0; i < eventsList.length; i++) {
                    yield this.handleAction(singlefin, eventsList[i], page, parameters, result, pageModels, eventObject).then((_result) => {
                        result = _result;
                    }).catch((ex) => {
                        return reject(ex);
                    });
                }
                resolve(result);
            }));
        }
        handleAction(singlefin, actions, page, parameters, result, pageModels, eventObject) {
            return new Promise((resolve, reject) => {
                let eventHandler = this.makeEventHandler(actions);
                eventHandler.handle(singlefin, actions, page, parameters, pageModels, eventObject).then((_result) => __awaiter(this, void 0, void 0, function* () {
                    resolve(_result);
                })).catch((ex) => {
                    reject("page '" + page.name + "' handle event error: " + ex);
                });
            });
        }
        makeEventHandler(actions) {
            if (actions.model) {
                return new SinglefinModule.ModelEventHandler(this);
            }
            else if (actions.controller) {
                return new SinglefinModule.ControllerEventHandler(this);
            }
            else if (actions.page) {
                return new SinglefinModule.PageEventHandler(this);
            }
            else if (actions.group) {
                return new SinglefinModule.GroupEventHandler(this);
            }
            else if (actions.request) {
                return new SinglefinModule.RequestEventHandler(this);
            }
            else if (actions.browser) {
                return new SinglefinModule.BrowserEventHandler(this);
            }
            else if (actions.event) {
                return new SinglefinModule.DelegateEventHandler(this);
            }
            return new SinglefinModule.NullEventHandler(this);
        }
    }
    SinglefinModule.EventManager = EventManager;
})(SinglefinModule || (SinglefinModule = {}));
/// <reference path="eventhandler.ts"/>
var SinglefinModule;
(function (SinglefinModule) {
    class GroupEventHandler extends SinglefinModule.EventHandler {
        handle(singlefin, delegate, page, parameters, pageModels, event) {
            return new Promise((resolve, reject) => {
                if (delegate.group.open) {
                    singlefin.openGroupPage(delegate.group.open, delegate.group.page, delegate.group.parameters, delegate.group.models).then(() => {
                        return resolve();
                    }).catch((ex) => {
                        return reject(ex);
                    });
                }
                if (delegate.group.reset) {
                    singlefin.resetGroupPage(delegate.group.reset);
                    return resolve();
                }
            });
        }
    }
    SinglefinModule.GroupEventHandler = GroupEventHandler;
})(SinglefinModule || (SinglefinModule = {}));
/// <reference path="eventhandler.ts"/>
var SinglefinModule;
(function (SinglefinModule) {
    class ModelEventHandler extends SinglefinModule.EventHandler {
        handle(singlefin, delegate, page, parameters, pageModels, event) {
            return new Promise((resolve, reject) => {
                if (pageModels) {
                    let modelMethodName = SinglefinModule.Runtime.getPropertyName(delegate.model);
                    if (pageModels[modelMethodName]) {
                        let pageModelMethodName = pageModels[modelMethodName].ref;
                        if (!pageModelMethodName) {
                            this.eventManager.handleEvent(singlefin, pageModels[modelMethodName], "on", page, parameters, pageModels).then(() => {
                                return resolve();
                            }).catch((ex) => {
                                return reject(ex);
                            });
                        }
                        else {
                            let model = SinglefinModule.Runtime.getParentInstance(singlefin.models, pageModelMethodName);
                            let modelMethod = SinglefinModule.Runtime.getProperty(singlefin.models, pageModelMethodName);
                            modelMethod.call(model, page.app, page, singlefin.models, parameters, event).then(() => {
                                if (!pageModels[modelMethodName].on) {
                                    return resolve();
                                }
                                this.eventManager.handleEvent(singlefin, pageModels[modelMethodName], "on", page, parameters, pageModels).then(() => {
                                    return resolve();
                                }).catch((ex) => {
                                    return reject(ex);
                                });
                            }).catch((ex) => {
                                return reject(ex);
                            });
                        }
                    }
                }
                let model = SinglefinModule.Runtime.getParentInstance(singlefin.models, delegate.model);
                let modelMethod = SinglefinModule.Runtime.getProperty(singlefin.models, delegate.model);
                modelMethod.call(model, page.app, page, singlefin.models, parameters, event).then(() => {
                    page.eventManager.handleEvent(singlefin, delegate, "resolved", page, parameters, null).then(() => {
                        return resolve();
                    }).catch((ex) => {
                        return reject(ex);
                    });
                }).catch((ex) => {
                    page.eventManager.handleEvent(singlefin, delegate, "rejected", page, parameters, null).then(() => {
                        return resolve();
                    }).catch((ex) => {
                        return reject(ex);
                    });
                });
            });
        }
    }
    SinglefinModule.ModelEventHandler = ModelEventHandler;
})(SinglefinModule || (SinglefinModule = {}));
/// <reference path="eventhandler.ts"/>
var SinglefinModule;
(function (SinglefinModule) {
    class NullEventHandler extends SinglefinModule.EventHandler {
        handle(singlefin, delegate, page, parameters, pageModels, event) {
            return Promise.reject("null event handler");
        }
    }
    SinglefinModule.NullEventHandler = NullEventHandler;
})(SinglefinModule || (SinglefinModule = {}));
/// <reference path="eventhandler.ts"/>
var SinglefinModule;
(function (SinglefinModule) {
    class PageEventHandler extends SinglefinModule.EventHandler {
        handle(singlefin, delegate, page, parameters, pageModels, event) {
            return new Promise((resolve, reject) => {
                let pageModels = {};
                for (let key in delegate.page.models) {
                    pageModels[key] = {};
                    let valuePath = delegate.page.models[key].ref;
                    if (valuePath) {
                        if (typeof valuePath === "string") {
                            valuePath = valuePath.replace(".$", "[" + page.index + "]");
                            valuePath = valuePath.trim();
                        }
                    }
                    pageModels[key].ref = valuePath;
                    pageModels[key].on = delegate.page.models[key].on;
                }
                if (delegate.page.open) {
                    singlefin.open(delegate.page.open, delegate.page.parameters, pageModels).then(() => {
                        return resolve();
                    });
                }
                else if (delegate.page.refresh) {
                    singlefin.refresh(delegate.page.refresh, delegate.page.parameters, pageModels).then(() => {
                        return resolve();
                    });
                }
                else if (delegate.page.close) {
                    singlefin.close(delegate.page.close, delegate.page.parameters).then(() => {
                        return resolve();
                    });
                }
                else {
                    reject("method '" + delegate.page + "' not supported");
                }
            });
        }
    }
    SinglefinModule.PageEventHandler = PageEventHandler;
})(SinglefinModule || (SinglefinModule = {}));
/// <reference path="eventhandler.ts"/>
var SinglefinModule;
(function (SinglefinModule) {
    class RequestEventHandler extends SinglefinModule.EventHandler {
        handle(singlefin, delegate, page, parameters, pageModels, event) {
            return new Promise((resolve, reject) => {
                let request = new SinglefinModule.Request(delegate.request);
                request.call(singlefin, page, singlefin.models, parameters, pageModels).then(() => {
                    resolve();
                }).catch((ex) => {
                    reject(ex);
                });
            });
        }
    }
    SinglefinModule.RequestEventHandler = RequestEventHandler;
})(SinglefinModule || (SinglefinModule = {}));
//# sourceMappingURL=singlefin.js.map