
module SinglefinModule {
    export class Page {
		private _app: App;
        private _name: string;
        private _disabled: boolean = false;
        private _action: string;
        private _container: string;
        private _path: string;
        private _view: string;
        private _controllers: any[];
        private _replace: any[];
        private _append: any[];
        private _group: any[];
        private _unwind: any[];
        private _list: any;
        private _events: any;
		private _parameters: any;
		private _isWidget: boolean;
		private _styles: string[];
		private _scripts: string[];
		private _models: any;
		private _htmlElement: any;

		private _index: number = 0;

        private _groupIndex: number = 0;
        private _groupNextStepEnabled: boolean = true;
		private _groupPreviousStepEnabled: boolean = true;

		private _binding: Binding = new Binding();
        

        constructor(app: App, name: string, disabled: boolean, action: string, container: string, path: string, view: any, controllers: any[], replace: any[], append: any[], group: any[], unwind: any[], list: {}, events: any, parameters: any, isWidget: boolean, styles: string[], scripts: string[], models: any) {
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
			this._parameters = parameters
			this._isWidget = isWidget;
			this._styles = styles;
			this._scripts = scripts;
			this._models = models;
        }

		public get app(): App {
            return this._app;
        }

        public set app(value: App) {
            this._app = value;
        }

        public get name(): string {
            return this._name;
        }

        public set name(value: string) {
            this._name = value;
        }

        public get disabled(): boolean {
            return this._disabled;
        }

        public set disabled(value: boolean) {
            this._disabled = value;
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

        public get list(): any {
            return this._list;
        }
        
        public set list(value: any) {
            this._list = value;
        }

        public get events(): any {
            return this._events;
        }
        
        public set events(value: any) {
            this._events = value;
        }

        public get parameters(): any {
            return this._parameters;
        }

        public set parameters(value: any) {
            this._parameters = value;
		}
		
		public get isWidget(): any {
            return this._isWidget;
        }

        public set isWidget(value: any) {
            this._isWidget = value;
		}
		
		public get styles(): string[] {
            return this._styles;
        }

        public set styles(value: string[]) {
            this._styles = value;
		}
		
		public get scripts(): string[] {
            return this._scripts;
        }

        public set scripts(value: string[]) {
            this._scripts = value;
		}
		
		public get models(): any {
            return this._models;
        }

        public set models(value: any) {
            this._models = value;
		}

        public get htmlElement(): any {
            return this._htmlElement;
        }

        public set htmlElement(value: any) {
            this._htmlElement = value;
		}
		
		public get index(): number {
            return this._index;
        }
        
        public set index(value: number) {
            this._index = value;
        }

        public get groupIndex(): number {
            return this._groupIndex;
        }
        
        public set groupIndex(value: number) {
            this._groupIndex = value;
        }

        public get groupNextStepEnabled(): boolean {
            return this._groupNextStepEnabled;
        }
        
        public set groupNextStepEnabled(value: boolean) {
            this._groupNextStepEnabled = value;
        }

        public get groupPreviousStepEnabled(): boolean {
            return this._groupPreviousStepEnabled;
        }

        public set groupPreviousStepEnabled(value: boolean) {
            this._groupPreviousStepEnabled = value;
		}

        draw(singlefin: Singlefin, parameters: any, models: any) {
			return new Promise((resolve, reject) => {
				this.drawBody(singlefin, parameters).then(() => {
					this.drawContainer(singlefin, this, this.container, parameters, models).then((htmlContainerElement: any) => {
						this.handleEvent(singlefin, this.events, "open", this, parameters).then((viewParameters: any) => {
							this.htmlElement = this.renderView(singlefin, this, viewParameters);
	
							this.addEventsHandlers(singlefin, this.app, this, this.htmlElement, viewParameters);
							this.bind(singlefin, this.htmlElement, viewParameters, models);
							
							this.drawItems(singlefin, this, viewParameters, models).then(() => {
								this.addHtmlElement(htmlContainerElement, this, singlefin);

								this.fireShowHtmlElementEvent();

								this.handleEvent(singlefin, this.events, "show", this, viewParameters).then(() => {
									resolve(this.htmlElement);
								}, () => {
									console.error("draw error");

									reject("draw error");
								});
							}, (ex: any) => {
								if(ex) {
									console.error("draw error");

									reject("draw error");
								}
								else {
									resolve($(``));
								}
							});
						}, (ex: any) => {
							if(ex) {
								console.error("draw error");

								reject("draw error");
							}
							else {
								resolve($(``));
							}
						});
					}, (ex: any) => {
						if(ex) {
							console.error("draw error");

							reject("draw error");
						}
						else {
							resolve($(``));
						}
					});
				}, (ex: any) => {
					if(ex) {
						console.error("draw error: " + ex);

						reject("draw error: " + ex);
					}
					else {
						resolve($(``));
					}
				});
			});
        }
        
        redraw(singlefin: Singlefin, parameters: any, models: any) {
			return new Promise((resolve, reject) => {
				this.drawContainer(singlefin, this, this.container, parameters, models).then((htmlContainerElement: any) => {
					this.reloadController(singlefin, this, parameters).then((viewParameters: any) => {
						var previousPageHtmlElement = this.htmlElement;

						this.htmlElement = this.renderView(singlefin, this, viewParameters);

						this.addEventsHandlers(singlefin, this.app, this, this.htmlElement, viewParameters);
						this.bind(singlefin, this.htmlElement, viewParameters, models);
						
						this.drawItems(singlefin, this, viewParameters, models).then(() => {
							previousPageHtmlElement.replaceWith(this.htmlElement);

							this.appendStyles();
							this.appendScripts();

							this.fireShowHtmlElementEvent();
							
							this.handleEvent(singlefin, this.events, "show", this, viewParameters).then(() => {
								resolve(this.htmlElement);
							}, (ex: any) => {
								if(ex) {
									console.error("redraw error");

									reject("redraw error");
								}
								else {
									resolve($(``));
								}
							});
						}, (ex: any) => {
							if(ex) {
                                console.error("redraw error");

								reject("redraw error");
							}
							else {
								resolve($(``));
							}
						});
					}, (ex: any) => {
						if(ex) {
                            console.error("redraw error");

							reject("redraw error");
						}
						else {
							resolve($(``));
						}
					});
				}, (ex: any) => {
					if(ex) {
                        console.error("redraw error");
                        
                        reject("redraw error");
					}
					else {
						resolve($(``));
					}
				});
			});
		}
		
		getCurrentGroupPage(singlefin: Singlefin) {
            if(!this.group) {
				return null;
			}
			
			var pagePath = this.group[this.groupIndex];

            return singlefin.pages[pagePath];
        }

		nextStep(singlefin: Singlefin, parameters: any, models: any) {
			var currentPage = this.getCurrentGroupPage(singlefin);
			
			this.groupIndex = this.groupIndex + 1;
			
			if(this.groupIndex >= this.group.length) {
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

		previousStep(singlefin: Singlefin, parameters: any, models: any) {
			var currentPage = this.getCurrentGroupPage(singlefin);
			
			this.groupIndex = this.groupIndex - 1;
			
			if(this.groupIndex < 0) {
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

		openGroupPageByIndex(singlefin: Singlefin, index: number, parameters: any, models: any) {
			this.groupIndex = index;
			
			if(this.groupIndex < 0) {
				this.groupIndex = 0;
			}

			if(this.groupIndex >= this.group.length) {
				this.groupIndex = this.group.length - 1;
			}

			return this.redraw(singlefin, parameters, models);
		}

		openGroupPage(singlefin: Singlefin, pageName: string, parameters: any, models: any) {
			var groupIndex = this.group.indexOf(pageName);

			if(groupIndex == -1) {
				console.error("group page " + pageName + " not found");
					
				Promise.reject("group page " + pageName + " not found");
			}

			this.groupIndex = groupIndex;

			return this.redraw(singlefin, parameters, models);
		}

		setNextGroupStepEnabled(singlefin: Singlefin, enabled: boolean) {
            var nextPage: Page = singlefin.pages[this.group[this.groupIndex]];

			if(!nextPage.parameters) {
				nextPage.parameters = {};
			}

			nextPage.parameters.nextEnabled = enabled;
        }

		isNextGroupStepEnabled(singlefin: Singlefin) {
			var nextPage: Page = singlefin.pages[this.group[this.groupIndex]];

			if(nextPage.parameters) {
				return nextPage.parameters.nextEnabled;
			}

			return true;
		}

		setPreviousGroupStepEnabled(singlefin: Singlefin, enabled: boolean) {
            var previousPage: Page = singlefin.pages[this.group[this.groupIndex]];

			if(!previousPage.parameters) {
				previousPage.parameters = {};
			}

			previousPage.parameters.previousEnabled = enabled;
		}
		
		isPreviousGroupStepEnabled(singlefin: Singlefin) {
			var previousPage: Page = singlefin.pages[this.group[this.groupIndex]];

			if(previousPage.parameters) {
				return previousPage.parameters.previousEnabled;
			}

			return true;
		}
        
		drawBody(singlefin: Singlefin, parameters: any) {
			var body: Page = singlefin.getBody();
			
			if(body.htmlElement) {
				return Promise.resolve(body.htmlElement);
			}

			return new Promise((resolve, reject) => {
				this.handleEvent(singlefin, body.events, "open", body, parameters).then(async (viewParameters: any) => {
					body.htmlElement = $("#" + body.name);
					
					body.appendStyles();
					body.appendScripts();

					var view = this.renderView(singlefin, body, viewParameters);

					body.htmlElement.append(view);

					this.handleEvent(singlefin, body.events, "show", body, viewParameters).then(() => {
						resolve(body.htmlElement);
					}, () => {
						console.error("draw body error");

						reject("draw body error");
					});
				}, (ex: any) => {
					if(ex) {
                        console.error("draw body error");

						reject("draw body error");
					}
					else {
						resolve($(``));
					}
				});
			});
        }
        
		drawContainer(singlefin: Singlefin, page: any, containerName: string, parameters: any, models: any) {
			var container: Page = singlefin.pages[containerName];

			if(!container) {
                console.error("container page '" + containerName + "' not found");

				return Promise.reject("container page '" + containerName + "' not found");
			}
			
			if(!container.htmlElement) {
				return this.drawParent(singlefin, page, containerName, parameters, models);
			}

			return Promise.resolve(container.htmlElement);
        }
        
		drawItems(singlefin: Singlefin, parent: Page, parameters: any, models: any) {
			return new Promise(async (resolve, reject) => {
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
			});
        }
        
		drawParent(singlefin: Singlefin, page: any, pageName: string, parameters: any, models: any) {
			return new Promise((resolve, reject) => {
				if(pageName == singlefin.body) {
					return resolve(singlefin.getBody().htmlElement);
				}
				
				var parentPage: Page = singlefin.pages[pageName];
	
				if(!parentPage) {
                    console.error("page not found");

					return reject("page not found");
				}
				
				this.drawContainer(singlefin, page, parentPage.container, parameters, models).then((htmlContainerElement) => {
					this.handleEvent(singlefin, parentPage.events, "open", parentPage, parameters).then(async (viewParameters: any) => {
						parentPage.htmlElement = this.renderView(singlefin, parentPage, viewParameters);

						this.addEventsHandlers(singlefin, parentPage.app, parentPage, htmlContainerElement, viewParameters);
						parentPage.bind(singlefin, htmlContainerElement, viewParameters, models);
						
						this.addHtmlElement(htmlContainerElement, parentPage, singlefin);

						resolve(parentPage.htmlElement);
					}, (ex) => {
						if(ex) {
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
        
		drawChildren(singlefin: Singlefin, parent: Page, children: any[], parameters: any, models: any) {
			return new Promise(async (resolve, reject) => {
				if(!children) {
					return resolve();
				}
				
				for(var i=0; i<children.length; i++) {
					var childPageName = children[i];
                    var childPage: Page = singlefin.pages[childPageName];

					if(childPage.action == "group") {
						if(parent.groupIndex != i) {
							continue;
						}
					}

					if(childPage.disabled == true) {
						continue;
					}

					await this.handleEvent(singlefin, childPage.events, "open", childPage, parameters).then(async (viewParameters: any) => {
						if(childPage.action == "unwind") {
							await this.unwindItems(singlefin, parent, childPageName, childPage, viewParameters, parameters, models).then(async () => {
								
							}, (ex) => {
								if(ex) {
									console.error("draw children error");

									return reject("draw children error");
								}
							});
						}
						else {
							childPage.htmlElement = this.renderView(singlefin, childPage, viewParameters);

							this.addEventsHandlers(singlefin, childPage.app, childPage, childPage.htmlElement, viewParameters);
							childPage.bind(singlefin, childPage.htmlElement, viewParameters, models);

							this.addHtmlElement(parent.htmlElement, childPage, singlefin);

							await this.drawItems(singlefin, childPage, viewParameters, models).then(async () => {
								await this.handleEvent(singlefin, childPage.events, "show", childPage, viewParameters).then(() => {

								}, () => {
									console.error("draw children error");

									reject("draw children error");
								});
							}, (ex) => {
								if(ex) {
									console.error("draw children error");

									return reject("draw children error");
								}
							});
						}
					}, (ex) => {
						if(ex) {
                            console.error("draw children error");

							return reject("draw children error");
						}
					});
				}

				resolve();
			});
        }
        
		unwindItems(singlefin: Singlefin, parent: Page, pageName: string, page: Page, parameters: any, controllerParameters: any, models: any) {
			return new Promise(async (resolve, reject) => {
				var list = parameters;

				if(page.list && page.list.from) {
					list = Runtime.getProperty(singlefin.models, page.list.from);
				}

                if(!Array.isArray(list)) {
                    console.error("unwind error page '" + pageName + "': controller must return an array");
                    
                    return reject("unwind error page '" + pageName + "': controller must return an array");
				}

				//TODO: rimuovere i surrogati per liberare memoria e gli eventi!?

				for(var i=0; i<list.length; i++) {
					var surrogate: Page = singlefin.addSurrogate(page.name + "#" + i, pageName + "/" + page.name + "#" + i, page.container, page);
					
					surrogate.index = i;

					await this.handleEvent(singlefin, surrogate.events, "unwind", surrogate, list[i]).then(async (viewParameters: any) => {
						surrogate.htmlElement = this.renderView(singlefin, surrogate, viewParameters);

						this.addEventsHandlers(singlefin, page.app, surrogate, surrogate.htmlElement, viewParameters);
						surrogate.bind(singlefin, surrogate.htmlElement, viewParameters, models);

						await this.drawItems(singlefin, surrogate, viewParameters, models).then(async () => {
							this.addHtmlElement(parent.htmlElement, surrogate, singlefin);

							//parent.bind(singlefin, parent.htmlElement, viewParameters, models);
						}, (ex) => {
							if(ex) {
                                console.error("unwind error");

								return reject("unwind error");
							}
						});
					}, (ex) => {
						if(ex) {
                            console.error("unwind error");

							return reject("unwind error");
						}
					});
				}

				if(page.list && page.list.from) {
					ProxyHandlerMap.registerPage(page.path);

					var valuePath = page.list.from;
					var data = singlefin.modelProxy.data;

					var valuePath = valuePath.replace(".$", "[" + page.index + "]");

					var elementBinding: ElementBinding = new ListBinding(page.htmlElement, "list", null, singlefin, page, page.list);

					elementBinding.watch(singlefin, page, null, valuePath, data, parameters);

					var proxyPath = Runtime.getParentPath(valuePath);
					var object = Runtime.getParentInstance(data, valuePath);
					var property = Runtime.getPropertyName(valuePath);

					var proxyHandler = ProxyHandlerMap.newProxy(proxyPath, object);
					ProxyHandlerMap.addElementBinding(page.path, proxyPath, property, elementBinding);
					
					Runtime.setProperty(proxyPath, data, proxyHandler.proxy);

					var value: any = Runtime.getProperty(data, valuePath);
					elementBinding.init(value);
				}

				resolve();
			});
		}

		addHandleEvent(singlefin: Singlefin, htmlElement: any, eventType: string, event: string, page: any, parameters: any) {
			if(!page.events) {
				return;
			}

			var events = page.events[event];

			if(!events) {
				return;
			}

			htmlElement.on(eventType, {
				event: event,
				app: singlefin,
				models: singlefin.models,
				page: page,
				data: parameters,
			}, (event: any) => {
				var eventData = event.data;

				eventData.page.handleEvent(singlefin, eventData.page.events, eventData.event, eventData.page, eventData.data, event);
			});
		}
		
		handleEvent(singlefin: Singlefin, events: any, event: any, page: Page, parameters: any, eventObject?: any) {
			return new Promise(async (resolve, reject) => {
				var result = parameters;

				if(!events) {
					return resolve(result);
				}

				var eventsList = events[event];

				if(!eventsList) {
					return resolve(result);
				}
                
				for(var i=0; i<eventsList.length; i++) {
					await this.handleControllerEvent(singlefin, eventsList[i], page, parameters, eventObject).then(async (_result: any) => {
						result = _result;

						return this.handleModelEvent(singlefin, eventsList[i], page, parameters);
					}, (ex: any) => {
						if(ex) {
							console.error("page '" + page.name + "' handle event error: " + ex);
						}

						reject(ex);
					}).then(async () => {
						return this.handlePageEvent(singlefin, eventsList[i]);
					}, (ex: any) => {
						if(ex) {
							console.error("page '" + page.name + "' handle event error: " + ex);
						}

						reject(ex);
					}).then(async () => {
						return this.handleGroupEvent(singlefin, eventsList[i]);
					}, (ex: any) => {
						if(ex) {
							console.error("page '" + page.name + "' handle event error: " + ex);
						}

						reject(ex);
					});
				}

				resolve(result);
			});
		}

		handleControllerEvent(singlefin: Singlefin, delegate: any, page: Page, parameters: any, event?: any) {
			return new Promise(async (resolve, reject) => {
				var result = parameters;

				if(!delegate.controller) {
					return resolve(result);
				}
	
				for(var i=0; i<page.controllers.length; i++) {
					var controller = page.controllers[i];
					var controllerMethod = controller[delegate.controller];
	
					if(controllerMethod) {
						var promise = controllerMethod.call(controller, page.app, page, parameters, event);

						if(promise) {
							await promise.then(async (_result: any) => {
								result = _result;
							}, (ex: any) => {
								if(ex) {
									console.error("page '" + page.name +  "' handle controller error: " + ex);
								}
								
								reject(ex);
							});
						}
					}
				}
	
				resolve(result);
			});
		}

		handleModelEvent(singlefin: Singlefin, delegate: any, page: Page, parameters: any) {
			if(!delegate.model) {
				return Promise.resolve();
			}

			var model = Runtime.getParentInstance(singlefin.models, delegate.model);
			var modelMethod = Runtime.getProperty(singlefin.models, delegate.model);

			return modelMethod.call(model, page.app, singlefin.models, parameters);
		}

		handlePageEvent(singlefin: Singlefin, delegate: any) {
			if(!delegate.page) {
				return Promise.resolve();
			}

			if(delegate.page.open) {
				return singlefin.open(delegate.page.open, delegate.page.parameters, delegate.page.models);
			}
			else if(delegate.page.refresh) {
				return singlefin.refresh(delegate.page.refresh, delegate.page.parameters, delegate.page.models);
			}
			else if(delegate.page.close) {
				return singlefin.close(delegate.page.close, delegate.page.parameters);
			}
			
			return Promise.reject("method '" + delegate.page + "' not supported");
		}

		handleGroupEvent(singlefin: Singlefin, delegate: any) {
			if(!delegate.group) {
				return Promise.resolve();
			}

			if(delegate.group.open) {
				return singlefin.openGroupPage(delegate.group.open, delegate.group.page, delegate.group.parameters, delegate.group.models);
			}
			
			return Promise.reject("method '" + delegate.page + "' not supported");
		}
        
		reloadController(singlefin: Singlefin, page: any, parameters: any) {			
			return new Promise(async (resolve, reject) => {
				if(!page.controllers) {
					return resolve(parameters);
				}

				var result = parameters;
				
				for(var i=0; i<page.controllers.length; i++) {					
					if(page.controllers[i].reload) {
						await page.controllers[i].reload(singlefin, page, result).then(async (_result: any) => {
							result = _result;
						}, (ex: any) => {
                            console.error("reload controller error: " + ex);
                            
                            reject("reload controller error: " + ex);
						});
					}
				}

				resolve(result);
			});
		}
		
		renderView(singlefin: Singlefin, page: Page, data: any) {
			if(!page.view) {
				return $();
			}

			var group: any = null;

			var currentGroupPage = page.getCurrentGroupPage(singlefin);

			if(currentGroupPage) {
				group = {
					page: currentGroupPage.name,
					index: page.groupIndex
				};
			}
			
			var html: string = this.resolveMarkup(page.view, {
				data: data,
				parameters: page.parameters,
				resources: singlefin.defaultResources,
				models: singlefin.models,
				group: group
			});

			html = this.resolveBracketsMarkup(html, singlefin.models);

			var htmlElement = $(html);

			return htmlElement;
		}

		bind(singlefin: Singlefin, htmlElement: any, data: any, models: any) {
			//this._binding = new Binding();

			this._binding.bind(singlefin, this, htmlElement, data, models);
		}

		nextController(singlefin: Singlefin, page: any, parameters: any) {
			return new Promise(async (resolve, reject) => {
				if(!page.controllers) {
					return resolve(parameters);
				}

				var result = parameters;
                
				for(var i=0; i<page.controllers.length; i++) {
					if(page.controllers[i].next) {
						await page.controllers[i].next(singlefin, page, result).then(async (_result: any) => {
							result = _result;
						}, (ex: any) => {
							if(ex) {
								console.error("next controller error: " + ex);
							}
							
							reject(ex);
						});
					}
				}

				resolve(result);
			});
		}

		previousController(singlefin: Singlefin, page: any, parameters: any) {
			return new Promise(async (resolve, reject) => {
			
				if(!page.controllers) {
					return resolve(parameters);
				}

				var result = parameters;
                
				for(var i=0; i<page.controllers.length; i++) {
					if(page.controllers[i].previous) {
						await page.controllers[i].previous(singlefin, page, result).then(async (_result: any) => {
							result = _result;
						}, (ex: any) => {
							if(ex) {
								console.error("next controller error: " + ex);
							}
							
							reject(ex);
						});
					}
				}

				resolve(result);
			});
		}

		resolveMarkup(markup: string, context: any): string {
            try {
				var markupRegex = /<%(.[\s\S]*?)%>/m; //TODO: il tag singleline (s) è supportato soltanto in ES2018; da modificare se si vogliono gestire le interruzioni linea \n
				
				var str = markup;

				var match = markupRegex.exec(str);
				
				while(match) {
					var result: any = null;
                
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
            catch(ex) {
                console.error("resolve markup error: " + ex);
                
                return markup;
            }
		}

		resolveBracketsMarkup(markup: string, models: any): string {
			try {
				var markupRegex = /{{(.[\s\S]*?)}}/m; //TODO: il tag singleline (s) è supportato soltanto in ES2018; da modificare se si vogliono gestire le interruzioni linea \n
				
				var str = markup;

				var match = markupRegex.exec(str);
				
				while(match) {
					var valuePath = match[1];				

					valuePath = valuePath.replace(".$", "[" + this.index + "]");
					valuePath = valuePath.trim();

					var value: any = Runtime.getProperty(models, valuePath);

					str = str.replace(match[0], value);

					match = markupRegex.exec(str);
				}

				return str;
            }
            catch(ex) {
                console.error("resolve markup error: " + ex);
                
                return markup;
            }
		}
        
		addHtmlElement(container: any, page: Page, singlefin: Singlefin) {
			var element = container;
			var elements = $();

			page.appendStyles();
			page.appendScripts();
			
			var pageName = page.name.split('#')[0];
			var pageTag = container.find("page[" + pageName +"]");

			var containerPagesAttribute = container.find("[pages]");

			containerPagesAttribute.each((i: number, item: any) => {
				var pageAttributeValues = $(item).attr("pages");
				var pages = pageAttributeValues.split(',');

				if(pages.indexOf(pageName) >= 0) {
					element = elements.add($(item));
				}
			});

			var containerPageAttribute = container.find(`[page="` + pageName + `"]`);

			if(containerPageAttribute.length > 0) {
				element = elements.add(containerPageAttribute);
			}
			
			if(pageTag.length > 0) {
				pageTag.before(page.htmlElement);

				if(elements.length == 0) {
					return;
				}
			}

			if(page.action == "replace") {
				element.html(page.htmlElement);

				var containerPage: Page = singlefin.pages[page.container];

				containerPage.appendStyles();
				containerPage.appendScripts();
			}
			else if(page.action == "append") {
				element.append(page.htmlElement);
			}
			else if(page.action == "group") {
				element.html(page.htmlElement);

				var containerPage: Page = singlefin.pages[page.container];

				containerPage.appendStyles();
				containerPage.appendScripts();
			}
			else if(page.action == "unwind") {
				element.append(page.htmlElement);
			}
		}

		fireShowHtmlElementEvent() {
			if(!this.htmlElement) {
				return;
			}

			this.htmlElement.find("select").trigger("singlefin:show");
		}

		appendStyles() {
			if(!this._styles) {
				return;
			}
			
			for(var i=0; i<this._styles.length; i++) {
				this.htmlElement.append(`<style type='text/css'>` + this._styles[i] + `</style>`);
			}
		}

		appendScripts() {
			if(!this._scripts) {
				return;
			}
			
			for(var i=0; i<this._scripts.length; i++) {
				var script = document.createElement("script");
				script.type = "text/javascript";
				script.text = this._scripts[i];
				this.htmlElement.append(script);
			}
		}
        
		addEventsHandlers(singlefin: Singlefin, app: App, page: Page, element: any, parameters: any) {
			if(!element) {
				return;
			}

			element.each((i: number, item: any) => {
				$.each(item.attributes, (i: number, attribute: any) => {
					if(attribute.specified) {
						if(attribute.name.startsWith("on-")) {
							var onAttribute = attribute.name.split("on-");
							var event = onAttribute[1];

							var handlerList = [];
					
							if(attribute.value) {
								handlerList = attribute.value.split(",");
							}

							for(var n=0; n<handlerList.length; n++) {
								var handler = handlerList[n];
								var paths = [];

								if(singlefin.handlers[handler]) {
									paths = singlefin.handlers[handler];
								}

								this.addHandleEvent(singlefin, element, event, handler, page, parameters);
							}
						}

						if(attribute.name == "href") {
							if(attribute.value.startsWith("page#")) {
								var href = attribute.value;

								var markup = href.split("#");

								if(markup.length > 0) {
									var path = markup[1];

									element.on("click", (event: any) => {
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

			children.each((i: number, item: any) => {
				this.addEventsHandlers(singlefin, app, page, $(item), parameters);
			});
        }
        
		close(singlefin: Singlefin, parameters: any) {
			return new Promise((resolve, reject) => {
				this.closeController(this, parameters).then(() => {
					this.closeItems(singlefin, this, parameters).then(() => {
						if(this.disabled == true) {
							this.htmlElement.remove();
						}

						resolve();
					}, (ex: any) => {
                        console.error("close error");
                        
                        reject("close error");
					});
				}, (ex: any) => {
                    console.error("close error");

					reject("close error");
				});
			});
        }
        
		closeController(page: any, parameters: any) {
			return new Promise(async (resolve, reject) => {
				if(!page.controllers) {
					return resolve(parameters);
				}

				var result = parameters;

				for(var i=0; i<page.controllers.length; i++) {
					if(page.controllers[i].close) {
						await page.controllers[i].close(page).then((_result: any) => {
							result = _result;
						}, (ex: any) => {
                            console.error("close controller error: " + ex);
                            
							return reject("close controller error" + ex);
						});
					}
				}

				resolve(result);
			});
        }
        
		closeItems(singlefin: Singlefin, page: any, parameters: any) {
			return new Promise((resolve, reject) => {
				if(page.group.length > 0) {
					page.groupIndex = 0;
				}
				
				this.closeChildren(singlefin, page.replace, parameters).then(() => {
					return this.closeChildren(singlefin, page.append, parameters);
				}, (ex) => {
					if(ex) {
						console.error("close itmes error");

						reject("close itmes error");
					}
					else {
						resolve();
					}
				}).then(() => {
					return this.closeChildren(singlefin, page.group, parameters);
				}, (ex) => {
					if(ex) {
						console.error("close itmes error");

						reject("close itmes error");
					}
					else {
						resolve();
					}
				}).then(() => {
					return this.closeChildren(singlefin, page.unwind, parameters);
				}, (ex) => {
					if(ex) {
						console.error("close itmes error");

						reject("close itmes error");
					}
					else {
						resolve();
					}
				}).then(() => {
					resolve();
				}, (ex) => {
					if(ex) {
						console.error("close itmes error");

						reject("close itmes error");
					}
					else {
						resolve();
					}
				});
			});
        }
        
		closeChildren(singlefin: Singlefin, children: any, parameters: any) {
			return new Promise(async (resolve, reject) => {
				if(!children) {
					return resolve();
				}
				
				for(var i=0; i<children.length; i++) {
					var childName = children[i];

					var page = singlefin.pages[childName];

					if(!page) {
						console.error("close children error: page '" + childName + "' not found");
						
						return resolve();
					}

					await this.closeItems(singlefin, page, parameters).then(async () => {
						this.closeController(page, parameters).then(() => {
						}, (ex) => {
							console.error("close children error");
						});
					}, (ex) => {
						console.error("close children error");
					});
				}

				resolve();
			});
		}
    }
}