
module BrowserModule {
    export class Page {
        private _name: string;
        private _action: string;
        private _container: string;
        private _path: string;
        private _view: string;
        private _controllers: any[];
        private _models: any[];
        private _replace: any[];
        private _append: any[];
        private _group: any[];
        private _unwind: any[];
        private _key: string;
        private _events: string[];
        private _parameters: any;
        private _htmlElement: any;
        

        constructor(name: string, action: string, container: string, path: string, view: any, controllers: any[], models: any, replace: any[], append: any[], group: any[], unwind: any[], key: string, events: string[], parameters: any) {
            this._name = name;
            this._action = action;
            this._container = container;
            this._path = path;
            this._view = view;
            this._controllers = controllers,
            this._models = models,
            this._replace = replace,
            this._append = append,
            this._group = group,
            this._unwind = unwind,
            this._key = key,
            this._events = events,
            this._parameters = parameters
        }

        public get name(): string {
            return this._name;
        }

        public set name(value: string) {
            this._name = value;
        }

        public get action(): string {
            return this._action;
        }

        public set action(value: string) {
            this._action = value;
        }

        public get container(): string {
            return this._container;
        }

        public set container(value: string) {
            this._container = value;
        }

        public get path(): string {
            return this._path;
        }

        public set path(value: string) {
            this._path = value;
        }

        public get view(): string {
            return this._view;
        }

        public set view(value: string) {
            this._view = value;
        }

        public get controllers(): any[] {
            return this._controllers;
        }
        
        public set controllers(value: any[]) {
            this._controllers = value;
        }

        public get models(): any[] {
            return this._models;
        }
        
        public set models(value: any[]) {
            this._models = value;
        }

        public get replace(): any[] {
            return this._replace;
        }
        
        public set replace(value: any[]) {
            this._replace = value;
        }

        public get append(): any[] {
            return this._append;
        }
        
        public set append(value: any[]) {
            this._append = value;
        }

        public get group(): any[] {
            return this._group;
        }
        
        public set group(value: any[]) {
            this._group = value;
        }

        public get unwind(): any[] {
            return this._unwind;
        }
        
        public set unwind(value: any[]) {
            this._unwind = value;
        }

        public get key(): string {
            return this._key;
        }
        
        public set key(value: string) {
            this._key = value;
        }

        public get events(): string[] {
            return this._events;
        }
        
        public set events(value: string[]) {
            this._events = value;
        }

        public get parameters(): any {
            return this._parameters;
        }

        public set parameters(value: any) {
            this._parameters = value;
        }

        public get htmlElement(): any {
            return this._htmlElement;
        }
        
        public set htmlElement(value: any) {
            this._htmlElement = value;
        }
    }
}