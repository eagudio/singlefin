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
        get model() {
            return this._singlefin.model;
        }
        open(pageName, parameters) {
            return this._singlefin.open(this._rootPath + pageName, parameters);
        }
        refresh(pageName, parameters) {
            return this._singlefin.refresh(this._rootPath + pageName, parameters);
        }
        close(pageName, parameters) {
            return this._singlefin.close(this._rootPath + pageName, parameters);
        }
    }
    SinglefinModule.App = App;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class Binding {
        constructor() {
            this.elementBinding = new SinglefinModule.ElementBinding();
            this.inputBinding = new SinglefinModule.InputBinding();
            this.textareaBinding = new SinglefinModule.TextareaBinding();
            this.checkboxBinding = new SinglefinModule.CheckboxBinding();
            this.radioBinding = new SinglefinModule.RadioBinding();
            this.selectBinding = new SinglefinModule.SelectBinding();
            this._dataProxyHandlers = [];
        }
        //TODO: la memoria potrebbe crescere con l'aumentare dei surrogati, perchè vengono instanziati nuovi handler. Eliminare gli handler quando vengono eliminati i surrogati
        bind(page, element, dataProxy) {
            if (!element) {
                return;
            }
            if (!dataProxy) {
                return;
            }
            dataProxy.addHandlers(page, this._dataProxyHandlers);
            this.in(element, dataProxy);
            this.is(element, dataProxy);
            this.outClass(page, element, dataProxy);
            this.outAttribute(page, element, dataProxy);
        }
        in(element, dataProxy) {
            var key = element.attr("model-value");
            this.elementBinding.in(element, element, dataProxy.proxy, key);
            this.inputBinding.in(element, element, dataProxy.proxy, key);
            this.textareaBinding.in(element, element, dataProxy.proxy, key);
            this.checkboxBinding.in(element, element, dataProxy.proxy, key);
            this.radioBinding.in(element, element, dataProxy.proxy, key);
            this.selectBinding.in(element, element, dataProxy.proxy, key);
            var children = element.find("[model-value]");
            for (var i = 0; i < children.length; i++) {
                var child = $(children[i]);
                var key = child.attr("model-value");
                this.elementBinding.in(element, child, dataProxy.proxy, key);
                this.inputBinding.in(element, child, dataProxy.proxy, key);
                this.textareaBinding.in(element, child, dataProxy.proxy, key);
                this.checkboxBinding.in(element, child, dataProxy.proxy, key);
                this.radioBinding.in(element, child, dataProxy.proxy, key);
                this.selectBinding.in(element, child, dataProxy.proxy, key);
            }
        }
        is(element, dataProxy) {
            var key = element.attr("is");
            this.elementBinding.is(element, element, dataProxy.proxy, key);
            this.inputBinding.is(element, element, dataProxy.proxy, key);
            this.textareaBinding.is(element, element, dataProxy.proxy, key);
            this.checkboxBinding.is(element, element, dataProxy.proxy, key);
            this.radioBinding.is(element, element, dataProxy.proxy, key);
            this.selectBinding.is(element, element, dataProxy.proxy, key);
            var children = element.find("[is]");
            for (var i = 0; i < children.length; i++) {
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
        outClass(page, element, dataProxy) {
            var key = element.attr("model-class");
            this.elementBinding.outClass(this._dataProxyHandlers, page, element, element, dataProxy, key);
            var children = element.find("[model-class]");
            for (var i = 0; i < children.length; i++) {
                var child = $(children[i]);
                var key = child.attr("model-class");
                this.elementBinding.outClass(this._dataProxyHandlers, page, element, child, dataProxy, key);
            }
        }
        outAttribute(page, element, dataProxy) {
            if (!element) {
                return;
            }
            element.each((i, item) => {
                $.each(item.attributes, (i, attribute) => {
                    if (attribute.specified) {
                        if (!attribute.name.startsWith("model-class") && attribute.name.startsWith("model-")) {
                            var onAttribute = attribute.name.split("model-");
                            var elementAttributeName = onAttribute[1];
                            this.elementBinding.outAttribute(this._dataProxyHandlers, page, element, element, dataProxy, elementAttributeName, attribute.value);
                            this.inputBinding.outAttribute(this._dataProxyHandlers, page, element, element, dataProxy, elementAttributeName, attribute.value);
                            this.textareaBinding.outAttribute(this._dataProxyHandlers, page, element, element, dataProxy, elementAttributeName, attribute.value);
                        }
                    }
                });
            });
            var children = element.children();
            children.each((i, item) => {
                this.outAttribute(page, $(item), dataProxy);
            });
        }
    }
    SinglefinModule.Binding = Binding;
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
                data[key] = value;
            }
            element.on("click", {
                data: data,
                key: key
            }, (event) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var inputElement = $(event.currentTarget);
                var value = inputElement.val();
                _data[_key] = value;
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
            data[key] = checked;
            element.on("click", {
                data: data,
                key: key
            }, (event) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var inputElement = $(event.currentTarget);
                var checked = inputElement.is(":checked");
                _data[_key] = checked;
            });
        }
    }
    SinglefinModule.CheckboxBinding = CheckboxBinding;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class ConfigLoader {
        load(config, singlefin) {
            var resources = config.resources;
            var models = config.models;
            var pages = config.pages;
            if (!pages) {
                throw "pages cannot be null or undefined";
            }
            this.processResources(resources, singlefin);
            if (models) {
                //singlefin.models = models;
                for (var modelKey in models) {
                    //singlefin.instances.push(models[modelKey]);
                    singlefin.models[modelKey] = this.unbundleJavascriptObject(models[modelKey]);
                }
            }
            var bodyName = Object.keys(pages)[0];
            singlefin.addBody(bodyName);
            var body = pages[bodyName];
            if (body.view) {
                singlefin.getBody().htmlElement = null;
                //singlefin.getBody().view = "text!" + body.view;
                //singlefin.instances.push(singlefin.getBody().view);
                singlefin.getBody().view = this.unbundleView(body.view);
            }
            if (body.controllers && Array.isArray(body.controllers)) {
                //singlefin.getBody().controllers = body.controllers;
                singlefin.getBody().controllers = [];
                for (var i = 0; i < body.controllers.length; i++) {
                    //singlefin.instances.push(body.controllers[i]);
                    singlefin.getBody().controllers.push(this.unbundleJavascriptObject(body.controllers[i]));
                }
            }
            singlefin.getBody().events = body.events;
            this.addHandlers(singlefin.body, singlefin);
            this.processPages("append", singlefin.body, body.append, config.widgets, singlefin, false, singlefin.body);
            this.processPages("replace", singlefin.body, body.replace, config.widgets, singlefin, false, singlefin.body);
            this.processPages("group", singlefin.body, body.group, config.widgets, singlefin, false, singlefin.body);
            this.processPages("unwind", singlefin.body, body.unwind, config.widgets, singlefin, false, singlefin.body);
        }
        processResources(resources, singlefin) {
            //singlefin.resources = resources;
            singlefin.resources = {};
            for (var languageKey in resources) {
                singlefin.resources[languageKey] = {};
                for (var resourceKey in resources[languageKey]) {
                    //singlefin.instances.push(resources[languageKey][resourceKey]);
                    singlefin.resources[languageKey][resourceKey] = this.unbundleJavascriptObject(resources[languageKey][resourceKey]);
                }
            }
        }
        addHandlers(pagePath, singlefin) {
            var _page = singlefin.pages[pagePath];
            if (_page.events) {
                for (var h = 0; h < _page.events.length; h++) {
                    if (!singlefin.handlers[_page.events[h]]) {
                        singlefin.handlers[_page.events[h]] = [];
                    }
                    singlefin.handlers[_page.events[h]].push(pagePath);
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
                    //TODO: probabilmente si deve clonare l'oggetto
                    page.isWidget = true;
                    page.view = widgets[page.widget].view;
                    page.controllers = widgets[page.widget].controllers;
                    page.replace = widgets[page.widget].replace;
                    page.append = widgets[page.widget].append;
                    page.group = widgets[page.widget].group;
                    page.unwind = widgets[page.widget].unwind;
                    page.styles = widgets[page.widget].styles;
                    page.appRootPath = pagePath;
                }
                var replaceChildren = this.processChildrenPage(pagePath, page.replace);
                var appendChildren = this.processChildrenPage(pagePath, page.append);
                var groupChildren = this.processChildrenPage(pagePath, page.group);
                var unwindChildren = this.processChildrenPage(pagePath, page.unwind);
                page.view = this.unbundleView(page.view);
                page.controllers = this.unbundleJavascriptObjects(page.controllers);
                page.styles = this.unbundleFiles(page.styles);
                singlefin.addPage(pageName, disabled, action, pagePath, containerName, page.view, page.controllers, replaceChildren, appendChildren, groupChildren, unwindChildren, page.key, page.events, page.parameters, page.isWidget, page.styles, page.appRootPath);
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
        unbundleJavascriptObjects(_objects) {
            if (!_objects) {
                return;
            }
            var objects = [];
            for (var i = 0; i < _objects.length; i++) {
                objects.push(this.unbundleJavascriptObject(_objects[i]));
            }
            ;
            return objects;
        }
        unbundleJson(json) {
            var jsonString = this.decodeBase64(json);
            return JSON.parse(jsonString);
        }
        unbundleJavascriptObject(javascriptObject) {
            var controllerContent = this.decodeBase64(javascriptObject);
            var define = (_obj) => {
                return _obj;
            };
            var obj = eval(controllerContent);
            return obj;
        }
        decodeBase64(data) {
            return decodeURIComponent(escape(atob(data)));
        }
    }
    SinglefinModule.ConfigLoader = ConfigLoader;
})(SinglefinModule || (SinglefinModule = {}));
/*declare var $: any;

module SinglefinModule {
    export class ConfigLoader {
        load(config: any, singlefin: Singlefin) {
            var resources = config.resources;
            var models = config.models;
            var pages = config.pages;
            
            if(!pages) {
                throw "pages cannot be null or undefined";
            }

            this.processResources(resources, singlefin);

            if(models) {
                singlefin.models = models;

                for (var modelKey in models) {
                    singlefin.instances.push(models[modelKey]);
                }
            }
    
            var bodyName = Object.keys(pages)[0];

            singlefin.addBody(bodyName);

            var body = pages[bodyName];

            if(body.view) {
                singlefin.getBody().htmlElement = null;
                singlefin.getBody().view = "text!" + body.view;

                singlefin.instances.push(singlefin.getBody().view);
            }

            if(body.controllers && Array.isArray(body.controllers)) {
                singlefin.getBody().controllers = body.controllers;
                
                for(var i=0; i<body.controllers.length; i++) {
                    singlefin.instances.push(body.controllers[i]);
                }
            }

            singlefin.getBody().events = body.events;

            this.addHandlers(singlefin.body, singlefin);
            
            this.processPages("append", singlefin.body, body.append, config.widgets, singlefin, false, singlefin.body);
            this.processPages("replace", singlefin.body, body.replace, config.widgets, singlefin, false, singlefin.body);
            this.processPages("group", singlefin.body, body.group, config.widgets, singlefin, false, singlefin.body);
            this.processPages("unwind", singlefin.body, body.unwind, config.widgets, singlefin, false, singlefin.body);
        }

        processResources(resources: any, singlefin: Singlefin) {
            singlefin.resources = resources;

            for (var languageKey in resources) {
                for (var resourceKey in resources[languageKey]) {
                    singlefin.instances.push(resources[languageKey][resourceKey]);
                }
            }
        }

        addHandlers(pagePath: string, singlefin: Singlefin) {
            var _page: any = singlefin.pages[pagePath];

            if(_page.events) {
                for(var h=0; h<_page.events.length; h++) {
                    if(!singlefin.handlers[_page.events[h]]) {
                        singlefin.handlers[_page.events[h]] = [];
                    }

                    singlefin.handlers[_page.events[h]].push(pagePath);
                }
                
            }
        }
        
        processPages(action: string, containerName: string, pages: any, widgets: any, singlefin: Singlefin, isWidget: boolean, appRootPath: string) {
            if(!action) {
                return;
            }

            if(!containerName) {
                throw "container missed";
            }

            if(pages == null) {
                return;
            }

            for(var i=0; i<pages.length; i++) {
                var pageName = Object.keys(pages[i])[0];
                var page = pages[i][pageName];
                page.isWidget = isWidget;
                page.appRootPath = appRootPath;

                var disabled: boolean = false;

                if(page.parameters) {
                    disabled = page.parameters.disabled;
                }

                var pagePath = containerName + "/" + pageName;

                if(page.widget) {
                    //TODO: probabilmente si deve clonare l'oggetto
                    page.isWidget = true;
                    page.view = widgets[page.widget].view;
                    page.controllers = widgets[page.widget].controllers;
                    page.replace = widgets[page.widget].replace;
                    page.append = widgets[page.widget].append;
                    page.group = widgets[page.widget].group;
                    page.unwind = widgets[page.widget].unwind;
                    page.styles = widgets[page.widget].styles;
                    page.appRootPath = pagePath;
                }

                var replaceChildren = this.processChildrenPage(pagePath, page.replace);
                var appendChildren = this.processChildrenPage(pagePath, page.append);
                var groupChildren = this.processChildrenPage(pagePath, page.group);
                var unwindChildren = this.processChildrenPage(pagePath, page.unwind);

                singlefin.addPage(pageName, disabled, action, pagePath, containerName, page.view, page.controllers, replaceChildren, appendChildren, groupChildren, unwindChildren, page.key, page.events, page.parameters, page.isWidget, page.styles, page.appRootPath);

                this.processPages("replace", pagePath, page.replace, widgets, singlefin, page.isWidget, page.appRootPath);
                this.processPages("append", pagePath, page.append, widgets, singlefin, page.isWidget, page.appRootPath);
                this.processPages("group", pagePath, page.group, widgets, singlefin, page.isWidget, page.appRootPath);
                this.processPages("unwind", pagePath, page.unwind, widgets, singlefin, page.isWidget, page.appRootPath);

                this.addHandlers(pagePath, singlefin);
            }
        }
        
        processChildrenPage(parentPagePath: string, childrenPage: any[]) {
            var children: any[] = [];
            
            if(!childrenPage) {
                return children;
            }

            for(var i=0; i<childrenPage.length; i++) {
                var childPageName = Object.keys(childrenPage[i])[0];
                
                var childPagePath = parentPagePath + "/" + childPageName;

                children.push(childPagePath);
            }

            return children;
        }
    }
}*/ 
var SinglefinModule;
(function (SinglefinModule) {
    let DataProxy = /** @class */ (() => {
        class DataProxy {
            constructor(_data) {
                this._proxy = null;
                this._data = _data;
                this._proxy = _data;
                DataProxy._proxyHandler = {
                    get(target, key) {
                        //WORK-AROUND: for Date object...
                        if (typeof target[key].getMonth === 'function') {
                            return target[key];
                        }
                        if (typeof target[key] === 'object' && target[key] !== null) {
                            return new Proxy(target[key], DataProxy._proxyHandler);
                        }
                        return target[key];
                    },
                    set: ((target, key, value) => {
                        target[key] = value;
                        for (var dataProxyHandlerKey in DataProxy._dataProxyHandlers) {
                            var dataProxyHandlers = DataProxy._dataProxyHandlers[dataProxyHandlerKey];
                            for (var i = 0; i < dataProxyHandlers.length; i++) {
                                dataProxyHandlers[i].handler(dataProxyHandlers[i].parameters);
                            }
                        }
                        return true;
                    })
                };
                if (this._data != null && typeof this._data == "object") {
                    this._proxy = new Proxy(this._data, DataProxy._proxyHandler);
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
        }
        DataProxy._proxyHandler = null;
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
    class ElementBinding {
        in(container, element, data, key) {
            if (element.is('textarea') || element.is('input') || element.is('select')) {
                return;
            }
            if (!key) {
                return;
            }
            element.on("click", {
                data: data,
                key: key
            }, (event) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var inputElement = $(event.currentTarget);
                var value = inputElement.attr("value");
                _data[_key] = value;
            });
        }
        is(container, element, data, key) {
        }
        outClass(dataProxyHandlers, page, container, element, dataProxy, exp) {
            if (!exp) {
                return;
            }
            var dataProxyHandler = new SinglefinModule.DataProxyHandler({
                element: element,
                exp: exp,
                dataProxy: dataProxy
            }, (parameters) => {
                try {
                    var proxyDataObject = new SinglefinModule.ProxyDataObject();
                    var classes = proxyDataObject.build(parameters.dataProxy.data, exp);
                    for (var key in classes) {
                        if (classes[key] == true) {
                            parameters.element.addClass(key);
                        }
                        else {
                            parameters.element.removeClass(key);
                        }
                    }
                }
                catch (ex) {
                    console.error("element class binding error: " + ex);
                }
            });
            dataProxyHandlers.push(dataProxyHandler);
        }
        outAttribute(dataProxyHandlers, page, container, element, dataProxy, key, exp) {
            if (element.is('textarea') || element.is('input') || element.is('select')) {
                return;
            }
            if (!key) {
                return;
            }
            if (!exp) {
                return;
            }
            var dataProxyHandler = new SinglefinModule.DataProxyHandler({
                element: element,
                key: key,
                exp: exp,
                dataProxy: dataProxy
            }, (parameters) => {
                try {
                    var proxyDataObject = new SinglefinModule.ProxyDataObject();
                    var result = proxyDataObject.build(parameters.dataProxy.data, exp);
                    parameters.element.attr(parameters.key, result);
                }
                catch (ex) {
                    console.error("element attribute binding error: " + ex);
                }
            });
            dataProxyHandlers.push(dataProxyHandler);
        }
    }
    SinglefinModule.ElementBinding = ElementBinding;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class InputBinding {
        in(container, element, data, key) {
            if (!element.is('input')) {
                return;
            }
            if (!key) {
                return;
            }
            element.on("change paste keyup", {
                data: data,
                key: key
            }, (event) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var inputElement = $(event.currentTarget);
                var value = inputElement.val();
                _data[_key] = value;
            });
        }
        is(container, element, data, key) {
        }
        outAttribute(dataProxyHandlers, page, container, element, dataProxy, key, exp) {
            if (!element.is('input')) {
                return;
            }
            if (!key) {
                return;
            }
            if (!exp) {
                return;
            }
            var dataProxyHandler = new SinglefinModule.DataProxyHandler({
                element: element,
                key: key,
                exp: exp,
                dataProxy: dataProxy
            }, (parameters) => {
                try {
                    var proxyDataObject = new SinglefinModule.ProxyDataObject();
                    var result = proxyDataObject.build(parameters.dataProxy.data, exp);
                    if (parameters.key == "value") {
                        parameters.element.val(result);
                    }
                    else {
                        parameters.element.attr(parameters.key, result);
                    }
                }
                catch (ex) {
                    console.error("element attribute binding error: " + ex);
                }
            });
            dataProxyHandlers.push(dataProxyHandler);
        }
    }
    SinglefinModule.InputBinding = InputBinding;
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
        constructor(app, name, disabled, action, container, path, view, controllers, replace, append, group, unwind, key, events, parameters, isWidget, styles) {
            this._disabled = false;
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
                this._key = key,
                this._events = events,
                this._parameters = parameters;
            this._isWidget = isWidget;
            this._styles = styles;
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
        get key() {
            return this._key;
        }
        set key(value) {
            this._key = value;
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
        get htmlElement() {
            return this._htmlElement;
        }
        set htmlElement(value) {
            this._htmlElement = value;
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
        draw(singlefin, parameters) {
            return new Promise((resolve, reject) => {
                /*if(this.action == "replace") {
                    this.removeStyles();
                }*/
                this.drawBody(singlefin, parameters).then(() => {
                    this.drawContainer(singlefin, this, this.container, parameters).then((htmlContainerElement) => {
                        this.loadController(singlefin, this, parameters).then((viewParameters) => {
                            this.htmlElement = this.renderView(singlefin, this, viewParameters);
                            this.addEventsHandlers(singlefin, this.app, this, this.htmlElement, viewParameters);
                            this.bind(singlefin, this.htmlElement);
                            this.drawItems(singlefin, this, viewParameters).then(() => {
                                this.addHtmlElement(htmlContainerElement, this);
                                this.showPage(singlefin, this, viewParameters).then(() => {
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
        redraw(singlefin, parameters) {
            return new Promise((resolve, reject) => {
                this.drawContainer(singlefin, this, this.container, parameters).then((htmlContainerElement) => {
                    this.reloadController(singlefin, this, parameters).then((viewParameters) => {
                        var previousPageHtmlElement = this.htmlElement;
                        this.htmlElement = this.renderView(singlefin, this, viewParameters);
                        this.addEventsHandlers(singlefin, this.app, this, this.htmlElement, viewParameters);
                        this.bind(singlefin, this.htmlElement);
                        this.drawItems(singlefin, this, viewParameters).then(() => {
                            previousPageHtmlElement.replaceWith(this.htmlElement);
                            this.showPage(singlefin, this, viewParameters).then(() => {
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
        nextStep(singlefin, parameters) {
            var currentPage = this.getCurrentGroupPage(singlefin);
            this.groupIndex = this.groupIndex + 1;
            if (this.groupIndex >= this.group.length) {
                this.groupIndex = this.group.length - 1;
            }
            return new Promise((resolve, reject) => {
                this.nextController(singlefin, currentPage, parameters).then(() => {
                    return this.redraw(singlefin, parameters);
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
        previousStep(singlefin, parameters) {
            var currentPage = this.getCurrentGroupPage(singlefin);
            this.groupIndex = this.groupIndex - 1;
            if (this.groupIndex < 0) {
                this.groupIndex = 0;
            }
            return new Promise((resolve, reject) => {
                this.previousController(singlefin, currentPage, parameters).then(() => {
                    return this.redraw(singlefin, parameters);
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
        openGroupByIndex(singlefin, index, parameters) {
            this.groupIndex = index;
            if (this.groupIndex < 0) {
                this.groupIndex = 0;
            }
            if (this.groupIndex >= this.group.length) {
                this.groupIndex = this.group.length - 1;
            }
            return this.redraw(singlefin, parameters);
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
        drawBody(singlefin, parameters) {
            var body = singlefin.getBody();
            if (body.htmlElement) {
                return Promise.resolve(body.htmlElement);
            }
            return new Promise((resolve, reject) => {
                this.loadController(singlefin, body, parameters).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                    var bodyHtmlElement = $("#" + body.name);
                    var view = this.renderView(singlefin, body, viewParameters);
                    bodyHtmlElement.append(view);
                    body.htmlElement = bodyHtmlElement;
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
        drawContainer(singlefin, page, containerName, parameters) {
            var container = singlefin.pages[containerName];
            if (!container) {
                console.error("container page '" + containerName + "' not found");
                return Promise.reject("container page '" + containerName + "' not found");
            }
            if (!container.htmlElement) {
                return this.drawParent(singlefin, page, containerName, parameters);
            }
            return Promise.resolve(container.htmlElement);
        }
        drawItems(singlefin, parentPage, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this.drawChildren(singlefin, parentPage, parentPage.replace, parameters).then(() => {
                    return this.drawChildren(singlefin, parentPage, parentPage.append, parameters);
                }, () => {
                    console.error("replace items error");
                    reject("replace items error");
                }).then(() => {
                    return this.drawChildren(singlefin, parentPage, parentPage.group, parameters);
                }, () => {
                    console.error("append items error");
                    reject("append items error");
                }).then(() => {
                    return this.drawChildren(singlefin, parentPage, parentPage.unwind, parameters);
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
        drawParent(singlefin, page, pageName, parameters) {
            return new Promise((resolve, reject) => {
                if (pageName == singlefin.body) {
                    return resolve(singlefin.getBody().htmlElement);
                }
                var parentPage = singlefin.pages[pageName];
                if (!parentPage) {
                    console.error("page not found");
                    return reject("page not found");
                }
                this.drawContainer(singlefin, page, parentPage.container, parameters).then((htmlContainerElement) => {
                    this.loadController(singlefin, parentPage, parameters).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                        parentPage.htmlElement = this.renderView(singlefin, parentPage, viewParameters);
                        this.addEventsHandlers(singlefin, parentPage.app, parentPage, htmlContainerElement, viewParameters);
                        parentPage.bind(singlefin, htmlContainerElement);
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
        drawChildren(singlefin, parent, children, parameters) {
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
                    yield this.loadController(singlefin, childPage, parameters).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                        if (childPage.action == "unwind") {
                            yield this.unwindItems(singlefin, parent, childPageName, childPage, viewParameters, parameters).then(() => __awaiter(this, void 0, void 0, function* () {
                            }), (ex) => {
                                if (ex) {
                                    console.error("draw children error");
                                    return reject("draw children error");
                                }
                            });
                        }
                        else {
                            childPage.htmlElement = this.renderView(singlefin, childPage, viewParameters);
                            this.addEventsHandlers(singlefin, childPage.app, childPage, childPage.htmlElement, viewParameters);
                            childPage.bind(singlefin, childPage.htmlElement);
                            this.addHtmlElement(parent.htmlElement, childPage);
                            yield this.drawItems(singlefin, childPage, viewParameters).then(() => __awaiter(this, void 0, void 0, function* () {
                                yield this.showPage(singlefin, childPage, viewParameters).then(() => {
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
        unwindItems(singlefin, parent, pageName, page, parameters, controllerParameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!Array.isArray(parameters)) {
                    console.error("unwind error page '" + pageName + "': controller must return an array");
                    return reject("unwind error page '" + pageName + "': controller must return an array");
                }
                //TODO: rimuovere i surrogati per liberare memoria e gli eventi!?
                for (var i = 0; i < parameters.length; i++) {
                    var surrogate = singlefin.addSurrogate(page.name + "#" + i, pageName + "/" + page.name + "#" + i, page.container, page);
                    yield this.resolveUnwindItem(singlefin, surrogate, parameters[i], controllerParameters).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                        surrogate.htmlElement = this.renderView(singlefin, surrogate, viewParameters);
                        this.addEventsHandlers(singlefin, page.app, surrogate, surrogate.htmlElement, viewParameters);
                        surrogate.bind(singlefin, surrogate.htmlElement);
                        yield this.drawItems(singlefin, surrogate, viewParameters).then(() => __awaiter(this, void 0, void 0, function* () {
                            this.addHtmlElement(parent.htmlElement, surrogate);
                            parent.bind(singlefin, parent.htmlElement);
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
        getCurrentGroupPage(singlefin) {
            if (!this) {
                return null;
            }
            var pagePath = this.group[this.groupIndex];
            return singlefin.pages[pagePath];
        }
        loadController(singlefin, page, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!page.controllers) {
                    return resolve(parameters);
                }
                var result = parameters;
                for (var i = 0; i < page.controllers.length; i++) {
                    if (page.controllers[i].load) {
                        yield page.controllers[i].load(singlefin, page, result).then((_result) => __awaiter(this, void 0, void 0, function* () {
                            result = _result;
                        }), (ex) => {
                            if (ex) {
                                console.error("load controller error: " + ex);
                            }
                            reject(ex);
                        });
                    }
                }
                resolve(result);
            }));
        }
        reloadController(singlefin, page, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!page.controllers) {
                    return resolve(parameters);
                }
                var result = parameters;
                for (var i = 0; i < page.controllers.length; i++) {
                    if (page.controllers[i].reload) {
                        yield page.controllers[i].reload(singlefin, page, result).then((_result) => __awaiter(this, void 0, void 0, function* () {
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
        renderView(singlefin, page, data) {
            if (!page.view) {
                return $();
            }
            var html = this.resolveMarkup(page.view, {
                data: data,
                parameters: page.parameters,
                resources: singlefin.defaultResources,
                models: singlefin.models,
                model: singlefin.model
            });
            var htmlElement = $(html);
            return htmlElement;
        }
        bind(singlefin, htmlElement) {
            this._binding = new SinglefinModule.Binding();
            this._binding.bind(this, htmlElement, singlefin.modelProxy);
        }
        showPage(singlefin, page, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!page.controllers) {
                    return resolve(parameters);
                }
                var result = parameters;
                for (var i = 0; i < page.controllers.length; i++) {
                    if (page.controllers[i].show) {
                        yield page.controllers[i].show(singlefin, page, result).then((_result) => __awaiter(this, void 0, void 0, function* () {
                            result = _result;
                        }), (ex) => {
                            if (ex) {
                                console.error("show page error: " + ex);
                            }
                            reject(ex);
                        });
                    }
                }
                resolve(result);
            }));
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
						
						result = ` + match[1] + `;
					})()`;
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
        resolveUnwindItem(singlefin, page, parameters, controllerParameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!page.controllers) {
                    return resolve(parameters);
                }
                var result = parameters;
                for (var i = 0; i < page.controllers.length; i++) {
                    if (page.controllers[i].unwind) {
                        yield page.controllers[i].unwind(singlefin, page, result, controllerParameters).then((_result) => __awaiter(this, void 0, void 0, function* () {
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
            var element = container;
            //page.appendStyles();
            var pageName = page.name.split('#')[0];
            var pageTag = container.find("page[" + pageName + "]");
            if (pageTag.length > 0) {
                pageTag.before(page.htmlElement);
                return;
            }
            var containerPageAttribute = container.find("[page]");
            if (containerPageAttribute.length > 0) {
                var pageAttributeValues = containerPageAttribute.attr("page");
                var pages = pageAttributeValues.split(',');
                if (pages.indexOf(pageName) >= 0) {
                    element = containerPageAttribute;
                }
            }
            if (page.action == "replace") {
                element.html(page.htmlElement);
            }
            else if (page.action == "append") {
                element.append(page.htmlElement);
            }
            else if (page.action == "group") {
                element.html(page.htmlElement);
            }
            else if (page.action == "unwind") {
                element.append(page.htmlElement);
            }
            page.appendStyles();
        }
        /*removeStyles() {
            var styles = $('head').find("[page]");

            styles.each((i: number, item: any) => {
                var style = $(item);

                if(!this._path.startsWith(style.attr("page"))) {
                    style.remove();
                }
            });
        }*/
        appendStyles() {
            /*if(!this._styles) {
                return;
            }
            
            for(var i=0; i<this._styles.length; i++) {
                var style = $('head').find("[page='" + this._path + "']");

                if(style.length == 0) {
                    $('head').append(`<link page="` + this._path + `" rel="stylesheet" href="./` + this._styles[i] + `.css" type="text/css" />`);
                }
            }*/
            if (!this._styles) {
                return;
            }
            for (var i = 0; i < this._styles.length; i++) {
                var style = $('head').find("[page='" + this._path + "']");
                if (style.length == 0) {
                    this.htmlElement.append(`<style type='text/css'>` + this._styles[i] + `</style>`);
                }
            }
        }
        addEventsHandlers(singlefin, app, page, element, parameters) {
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
                                for (var z = 0; z < page.controllers.length; z++) {
                                    var controller = page.controllers[z];
                                    var method = controller[handler];
                                    if (method) {
                                        this.addEventHandler(singlefin, app, page, page, page.path, element, event, method, parameters);
                                    }
                                }
                                for (var p = 0; p < paths.length; p++) {
                                    var handlerPage = singlefin.pages[paths[p]];
                                    for (var c = 0; c < handlerPage.controllers.length; c++) {
                                        if (handlerPage.controllers[c][handler]) {
                                            this.addEventHandler(singlefin, app, handlerPage, page, paths[p], element, event, handlerPage.controllers[c][handler], parameters);
                                        }
                                    }
                                }
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
                this.addEventsHandlers(singlefin, app, page, $(item), parameters);
            });
        }
        addEventHandler(singlefin, app, handlerPage, page, path, htmlElement, eventType, handler, data) {
            htmlElement.on(eventType, {
                app: singlefin,
                event: eventType,
                handler: handler,
                data: data,
                path: path,
                page: page,
                target: handlerPage,
                htmlElement: htmlElement
            }, (event) => {
                var jqueryEventData = event.data;
                var eventObject = {
                    jQueryEvent: event,
                    htmlElement: jqueryEventData.htmlElement,
                    htmlElementTarget: jqueryEventData.htmlElement,
                    target: jqueryEventData.target,
                    path: jqueryEventData.path,
                    eventType: jqueryEventData.eventType
                };
                //TODO: workaround: per gli elementi surrogati di unwind non si ha sempre disponibile l'htmlElement perchè in realtà viene passato l'oggetto originale (non il surrogato)
                eventObject.htmlElementTarget = eventObject.target.htmlElement ? eventObject.target.htmlElement : eventObject.htmlElement;
                event.data = null;
                jqueryEventData.handler(jqueryEventData.target.app, jqueryEventData.page, jqueryEventData.data, eventObject);
            });
        }
        close(singlefin, parameters) {
            return new Promise((resolve, reject) => {
                this.closeItems(singlefin, this, parameters).then(() => {
                    this.closeController(this, parameters).then(() => {
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
    class ProxyDataObject {
        build(data, exp) {
            var vars = "";
            for (var key in data) {
                this[key] = data[key];
                vars = vars + "var " + key + " = this." + key + ";";
            }
            var result;
            var code = vars + `
                result = ` + exp + `;
            `;
            eval(code);
            return result;
        }
    }
    SinglefinModule.ProxyDataObject = ProxyDataObject;
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
                data[key] = value;
            }
            element.on("click", {
                data: data,
                key: key
            }, (event) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var inputElement = $(event.currentTarget);
                var value = inputElement.val();
                _data[_key] = value;
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
            data[key] = checked;
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
                        _data[isAttributeValue] = _checked;
                    }
                }
            });
        }
    }
    SinglefinModule.RadioBinding = RadioBinding;
})(SinglefinModule || (SinglefinModule = {}));
var SinglefinModule;
(function (SinglefinModule) {
    class SelectBinding {
        in(container, element, data, key) {
            if (!element.is('select')) {
                return;
            }
            if (!key) {
                return;
            }
            data[key] = element.val();
            element.on("change", {
                data: data,
                key: key
            }, (event) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var inputElement = $(event.currentTarget);
                var value = inputElement.val();
                _data[_key] = value;
            });
        }
        is(container, element, data, key) {
        }
    }
    SinglefinModule.SelectBinding = SelectBinding;
})(SinglefinModule || (SinglefinModule = {}));
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
    class Singlefin {
        constructor(config) {
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
            this._model = {};
            this.init(config);
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
            return this._models;
        }
        get handlers() {
            return this._handlers;
        }
        get modelProxy() {
            return this._modelProxy;
        }
        get model() {
            return this._modelProxy.proxy;
        }
        getBody() {
            return this._pages[this._body];
        }
        init(config) {
            try {
                this._modelProxy = new SinglefinModule.DataProxy(this._model);
                var params = this.getUrlParams(window.location.href);
                var configLoader = new SinglefinModule.ConfigLoader();
                configLoader.load(config, this);
                /*this.loadInstances(config.paths).then(() => {
                    var _homepage = config.homepage;
                
                    if(params) {
                        if(params.page) {
                            this._home = params.page;
        
                            _homepage = this._home;
                        }
                    }
                    
                    return this.open(_homepage);
                }, () => {

                });*/
                var _homepage = config.homepage;
                if (params) {
                    if (params.page) {
                        this._home = params.page;
                        _homepage = this._home;
                    }
                }
                return this.open(_homepage);
            }
            catch (ex) {
                console.error("an error occurred during init singlefin: " + ex);
            }
        }
        open(pageName, parameters) {
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
                page.draw(this, parameters).then(() => {
                    resolve(page);
                }, (error) => {
                    console.error("an error occurred during open page '" + pageName + "'");
                    resolve();
                });
            });
        }
        refresh(pageName, parameters) {
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
                page.redraw(this, parameters).then(() => {
                    resolve(page);
                }, (error) => {
                    console.error("an error occurred during refresh page '" + pageName + "'");
                    resolve();
                });
            });
        }
        nextGroupStep(pageName, parameters) {
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
                page.nextStep(this, parameters).then(() => {
                    resolve(page);
                }, (error) => {
                    console.error("an error occurred during next step of page '" + pageName + "'");
                    resolve();
                });
            });
        }
        previousGroupStep(pageName, parameters) {
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
                page.previousStep(this, parameters).then(() => {
                    resolve(page);
                }, (error) => {
                    console.error("an error occurred during next step of page '" + pageName + "'");
                    resolve();
                });
            });
        }
        openGroupStep(pageName, index, parameters) {
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
                page.openGroupByIndex(this, index, parameters).then(() => {
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
            var body = new SinglefinModule.Page(app, name, false, "", this._body, "", null, [], [], [], [], [], "", [], null, false, []);
            this._pages[this._body] = body;
        }
        addPage(pageName, disabled, action, pagePath, container, view, controllers, replace, append, group, unwind, key, events, parameters, isWidget, styles, appRootPath) {
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
            this._pages[pagePath] = new SinglefinModule.Page(app, pageName, disabled, action, container, relativePath, view, controllers, replace, append, group, unwind, key, events, parameters, isWidget, styles);
            return this._pages[pagePath];
        }
        /*addPage(pageName: string, disabled: boolean, action: string, pagePath: string, container: string, view: string, controllers: any[], replace: any[], append: any[], group: any[], unwind: any[], key: string, events: string[], parameters: any, isWidget: boolean, styles: string[], appRootPath: string): Page {
            if(view) {
                this._instances.push("text!" + view);
            }

            if(controllers) {
                for(var i=0; i<controllers.length; i++) {
                    this._instances.push(controllers[i]);
                };
            }
            
            var bodyRegexp = new RegExp("^(" + this.body + "/)");
            var pathContainer = container.replace(bodyRegexp, "");

            var app: App = new App(this);

            if(isWidget) {
                var rootPath = appRootPath.replace(bodyRegexp, "");

                app.rootPath = rootPath + "/";
            }

            var relativePath = pathContainer + "/" + pageName;

            if(pathContainer == this.body) {
                relativePath = pageName;
            }

            this._pages[pagePath] = new Page(app, pageName, disabled, action, container, relativePath, view ? "text!" + view : undefined, controllers, replace, append, group, unwind, key, events, parameters, isWidget, styles);

            return this._pages[pagePath];
        }*/
        addSurrogate(name, path, containerPath, page) {
            var replaceChildren = this.createSurrogates(path, page.replace);
            var appendChildren = this.createSurrogates(path, page.append);
            var groupChildren = this.createSurrogates(path, page.group);
            var unwindChildren = this.createSurrogates(path, page.unwind);
            var bodyRegexp = new RegExp("^(" + this.body + "/)");
            var relativePath = path.replace(bodyRegexp, "");
            this._pages[path] = new SinglefinModule.Page(page.app, name, page.disabled, page.action, containerPath, relativePath, page.view, page.controllers, replaceChildren, appendChildren, groupChildren, unwindChildren, page.key, page.events, page.parameters, page.isWidget, page.styles);
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
        loadInstances(pathsMap) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                var loader = new SinglefinModule.Loader();
                loader.load(this._instances, pathsMap).then(() => {
                    try {
                        /*for(var i=0; i<this._styles.length; i++) {
                            $('head').append(`<link rel="stylesheet" href="` + this._styles[i] + `.css" type="text/css" />`);
                        }*/
                        for (var languageKey in this._resources) {
                            for (var resourceKey in this._resources[languageKey]) {
                                this._resources[languageKey][resourceKey] = loader.getInstance(this._resources[languageKey][resourceKey], pathsMap);
                            }
                        }
                        for (var key in this._models) {
                            this._models[key] = loader.getInstance(this._models[key], pathsMap);
                        }
                        for (var key in this._pages) {
                            if (this._pages[key].view) {
                                this._pages[key].view = loader.getInstance(this._pages[key].view, pathsMap);
                            }
                            var controllers = [];
                            if (this._pages[key].controllers && Array.isArray(this._pages[key].controllers)) {
                                controllers = this._pages[key].controllers.map((controller) => {
                                    return loader.getInstance(controller, pathsMap);
                                });
                            }
                            this._pages[key].controllers = controllers;
                            var styles = [];
                            if (this._pages[key].styles && Array.isArray(this._pages[key].styles)) {
                                styles = this._pages[key].styles.map((style) => {
                                    //TODO: gli stili non vengono caricati con require, quindi i path sono differenti (require deve avere un 'aggiustamento' perchè considera il path dalla cartella in cui risiede lo script require.js)
                                    //      si dovrebbe quindi eliminare l'utilizzo di require e pensare ad un sistema per creare un bundle con view e controller
                                    return loader.normalizePath(style, pathsMap);
                                });
                            }
                            this._pages[key].styles = styles;
                        }
                        resolve();
                    }
                    catch (ex) {
                        console.error("load instances error: " + ex);
                        reject("load instances error: " + ex);
                    }
                }, (error) => {
                    console.error("load instances error");
                    reject("load instances error");
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
    SinglefinModule.Singlefin = Singlefin;
})(SinglefinModule || (SinglefinModule = {}));
window.Singlefin = window.Singlefin || SinglefinModule.Singlefin;
var SinglefinModule;
(function (SinglefinModule) {
    class TextareaBinding {
        in(container, element, data, key) {
            if (!element.is('textarea')) {
                return;
            }
            if (!key) {
                return;
            }
            element.on("change paste keyup", {
                data: data,
                key: key
            }, (event) => {
                var _data = event.data.data;
                var _key = event.data.key;
                var inputElement = $(event.currentTarget);
                var value = inputElement.val();
                _data[_key] = value;
            });
        }
        is(container, element, data, key) {
        }
        outAttribute(dataProxyHandlers, page, container, element, dataProxy, key, exp) {
            if (!element.is('textarea')) {
                return;
            }
            if (!key) {
                return;
            }
            if (!exp) {
                return;
            }
            var dataProxyHandler = new SinglefinModule.DataProxyHandler({
                element: element,
                key: key,
                exp: exp,
                dataProxy: dataProxy
            }, (parameters) => {
                try {
                    var proxyDataObject = new SinglefinModule.ProxyDataObject();
                    var result = proxyDataObject.build(parameters.dataProxy.data, exp);
                    if (parameters.key == "value") {
                        parameters.element.val(result);
                    }
                    else {
                        parameters.element.attr(parameters.key, result);
                    }
                }
                catch (ex) {
                    console.error("element attribute binding error: " + ex);
                }
            });
            dataProxyHandlers.push(dataProxyHandler);
        }
    }
    SinglefinModule.TextareaBinding = TextareaBinding;
})(SinglefinModule || (SinglefinModule = {}));
//# sourceMappingURL=singlefin.js.map