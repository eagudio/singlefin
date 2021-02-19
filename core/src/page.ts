
module SinglefinModule {
    export class Page {
		private _app: App;
        private _name: string;
		private _hidden: string;
		private _showed: string;
        private _action: string;
        private _container: string;
        private _path: string;
        private _view: string;
        private _controllers: any[];
        private _replace: any[];
        private _append: any[];
		private _commit: any[];
        private _group: any[];
        private _unwind: any;
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

		private _eventManager: EventManager = new EventManager();
		private _binding: Binding = new Binding();
        

        constructor(app: App, name: string, hidden: any, showed: any, action: string, container: string, path: string, view: any, controllers: any[], replace: any[], append: any[], commit: any[], group: any[], unwind: {}, events: any, parameters: any, isWidget: boolean, styles: string[], scripts: string[], models: any) {
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

		public get hidden(): string {
            return this._hidden;
        }

        public set hidden(value: string) {
            this._hidden = value;
        }

		public get showed(): string {
            return this._showed;
        }

        public set showed(value: string) {
            this._showed = value;
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

		public get commit(): any[] {
            return this._commit;
        }
        
        public set commit(value: any[]) {
            this._commit = value;
        }

        public get group(): any[] {
            return this._group;
        }
        
        public set group(value: any[]) {
            this._group = value;
        }

        public get unwind(): any {
            return this._unwind;
        }
        
        public set unwind(value: any) {
            this._unwind = value;
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

		public get eventManager(): EventManager {
			return this._eventManager;
		}

        draw(singlefin: Singlefin, parameters: any, models: any) {
			return new Promise((resolve, reject) => {
				this.drawBody(singlefin, parameters, models).then(() => {
					this.drawContainer(singlefin, this, this.container, parameters, models).then((htmlContainerElement: any) => {
						this.eventManager.handleEvent(singlefin, this.events, "open", this, parameters, models).then((viewParameters: any) => {
							this.htmlElement = this.renderView(singlefin, this, viewParameters, models);
	
							this.eventManager.addEventsHandlers(singlefin, this.app, this, this.htmlElement, viewParameters, models);
							this.bind(singlefin, this.htmlElement, viewParameters, models);
							
							this.drawItems(singlefin, this, viewParameters, models).then(() => {
								this.addHtmlElement(htmlContainerElement, this, singlefin);

								this.fireShowHtmlElementEvent();

								this.eventManager.handleEvent(singlefin, this.events, "show", this, viewParameters, models).then(() => {
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
					this.eventManager.handleEvent(singlefin, this.events, "refresh", this, parameters, models).then((viewParameters: any) => {
						var previousPageHtmlElement = this.htmlElement;

						this.htmlElement = this.renderView(singlefin, this, viewParameters, models);

						this.eventManager.addEventsHandlers(singlefin, this.app, this, this.htmlElement, viewParameters, models);
						this.bind(singlefin, this.htmlElement, viewParameters, models);
						
						this.drawItems(singlefin, this, viewParameters, models).then(() => {
							previousPageHtmlElement.replaceWith(this.htmlElement);

							this.appendStyles();
							this.appendScripts();

							this.fireShowHtmlElementEvent();
							
							this.eventManager.handleEvent(singlefin, this.events, "show", this, viewParameters, models).then(() => {
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

		close(singlefin: Singlefin, parameters: any, models: any) {
			return new Promise<void>((resolve, reject) => {
				this.closeItems(singlefin, this, parameters).then(() => {
					this.eventManager.handleEvent(singlefin, this.events, "close", this, parameters, models).then((viewParameters: any) => {
						if(this.action == "commit") {
							this.htmlElement.remove();
						}

						resolve();
					}).catch((ex: any) => {
						console.error("close error");
					
						reject("close error");
					});
				}, (ex: any) => {
					console.error("close error");
					
					reject("close error");
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
        
		drawBody(singlefin: Singlefin, parameters: any, models: any) {
			var body: Page = singlefin.getBody();
			
			if(body.htmlElement) {
				return Promise.resolve(body.htmlElement);
			}

			return new Promise((resolve, reject) => {
				this.eventManager.handleEvent(singlefin, body.events, "open", body, parameters, models).then(async (viewParameters: any) => {
					body.htmlElement = $("#" + body.name);
					
					body.appendStyles();
					body.appendScripts();

					var view = this.renderView(singlefin, body, viewParameters, models);

					body.htmlElement.append(view);

					this.eventManager.handleEvent(singlefin, body.events, "show", body, viewParameters, models).then(() => {
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
			return new Promise<void>(async (resolve, reject) => {
				this.drawChildren(singlefin, parent, parent.replace, parameters, models).then(() => {
					return this.drawChildren(singlefin, parent, parent.append, parameters, models);
				}, () => {
					console.error("replace items error");

					reject("replace items error");
				}).then(() => {
					return this.drawChildren(singlefin, parent, parent.commit, parameters, models);
				}, () => {
					console.error("append items error");

					reject("append items error");
				}).then(() => {
					return this.drawChildren(singlefin, parent, parent.group, parameters, models);
				}, () => {
					console.error("commit items error");

					reject("commit items error");
				}).then(() => {
					resolve();
				}, () => {
					console.error("group items error");

					reject("group items error");
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
					this.eventManager.handleEvent(singlefin, parentPage.events, "open", parentPage, parameters, models).then(async (viewParameters: any) => {
						parentPage.htmlElement = this.renderView(singlefin, parentPage, viewParameters, models);

						this.eventManager.addEventsHandlers(singlefin, parentPage.app, parentPage, htmlContainerElement, viewParameters, models);
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
			return new Promise<void>(async (resolve, reject) => {
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

					await this.eventManager.handleEvent(singlefin, childPage.events, "open", childPage, parameters, models).then(async (viewParameters: any) => {
						if(childPage.unwind) {
							await this.unwindItems(singlefin, parent, childPageName, childPage, viewParameters, parameters, models).then(async () => {
								
							}, (ex) => {
								if(ex) {
									console.error("draw children error");

									return reject("draw children error");
								}
							});
						}
						else if(childPage.action != "commit") {
							childPage.htmlElement = this.renderView(singlefin, childPage, viewParameters, models);

							this.eventManager.addEventsHandlers(singlefin, childPage.app, childPage, childPage.htmlElement, viewParameters, models);
							childPage.bind(singlefin, childPage.htmlElement, viewParameters, models);

							this.addHtmlElement(parent.htmlElement, childPage, singlefin);

							await this.drawItems(singlefin, childPage, viewParameters, models).then(async () => {
								await this.eventManager.handleEvent(singlefin, childPage.events, "show", childPage, viewParameters, models).then(() => {

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
			return new Promise<void>(async (resolve, reject) => {
				var unwind = parameters;

				if(page.unwind && page.unwind.list) {
					unwind = Runtime.getProperty(singlefin.models, page.unwind.list);
				}

                if(!Array.isArray(unwind)) {
                    console.error("unwind error page '" + pageName + "': list must to be an array");
                    
                    return reject("unwind error page '" + pageName + "': list must to be an array");
				}

				//TODO: rimuovere i surrogati per liberare memoria e gli eventi!?

				for(var i=0; i<unwind.length; i++) {
					var surrogate: Page = singlefin.addSurrogate(page.name + "#" + i, pageName + "/" + page.name + "#" + i, page.container, page);
					
					surrogate.index = i;

					await this.eventManager.handleEvent(singlefin, surrogate.events, "unwind", surrogate, unwind[i], models).then(async (viewParameters: any) => {
						surrogate.htmlElement = surrogate.renderView(singlefin, surrogate, viewParameters, models);

						this.eventManager.addEventsHandlers(singlefin, page.app, surrogate, surrogate.htmlElement, viewParameters, models);
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

				if(page.unwind && page.unwind.list) {
					ProxyHandlerMap.registerPage(page.path);

					var valuePath = page.unwind.list;

					var valuePath = valuePath.replace(".$", "[" + page.index + "]");

					var elementBinding: ElementBinding = new ListBinding(page.htmlElement, "unwind", null, singlefin, page, page.unwind);

					elementBinding.watch(singlefin, page, null, valuePath, singlefin.models, parameters);

					var proxyPath = Runtime.getParentPath(valuePath);
					var object = Runtime.getParentInstance(singlefin.models, valuePath);
					var property = Runtime.getPropertyName(valuePath);

					var proxyHandler = ProxyHandlerMap.newProxy(proxyPath, object);
					ProxyHandlerMap.addElementBinding(page.path, proxyPath, property, elementBinding);

					var value: any = Runtime.getProperty(singlefin.models, valuePath);
					
					Runtime.setProperty(proxyPath, singlefin.models, proxyHandler.proxy);

					elementBinding.init(value);
				}

				resolve();
			});
		}
		
		renderView(singlefin: Singlefin, page: Page, data: any, models: any) {
			if(!page.view) {
				return null;
				//return $();
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

			html = page.resolveBracketsMarkup(html, singlefin.models, models);

			var htmlElement = $(html);

			return htmlElement;
		}

		bind(singlefin: Singlefin, htmlElement: any, data: any, models: any) {
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

		resolveBracketsMarkup(markup: string, models: any, pageModels: any): string {
			try {
				var markupRegex = /{{(.[\s\S]*?)}}/m; //TODO: il tag singleline (s) è supportato soltanto in ES2018; da modificare se si vogliono gestire le interruzioni linea \n
				
				var str = markup;

				var match = markupRegex.exec(str);
				
				while(match) {
					var valuePath = match[1];				

					valuePath = valuePath.replace(".$", "[" + this.index + "]");
					valuePath = valuePath.trim();

					if(pageModels) {
						if(pageModels[valuePath]) {
							valuePath = pageModels[valuePath].binding;
						}
					}

					if(this.models) {
						if(this.models[valuePath]) {
							valuePath = this.models[valuePath].binding;
						}
					}

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

			if(!element) {
				var containerPage: Page = singlefin.pages[page.container];
				
				var parentPage: Page = singlefin.pages[containerPage.container];

				element = parentPage.htmlElement;
			}

			if(page.hidden) {
				var hidden: boolean = Runtime.getProperty(singlefin.models, page.hidden);

				if(hidden == true) {
					return;
				}
			}

			if(page.showed) {
				var showed: boolean = Runtime.getProperty(singlefin.models, page.showed);

				if(showed == false) {
					return;
				}
			}

			page.appendStyles();
			page.appendScripts();
			
			var pageName = page.name.split('#')[0];
			var pageTag = element.find("page[" + pageName +"]");

			var containerPagesAttribute = element.find("[pages]");

			containerPagesAttribute.each((i: number, item: any) => {
				var pageAttributeValues = $(item).attr("pages");
				var pages = pageAttributeValues.split(',');

				if(pages.indexOf(pageName) >= 0) {
					element = elements.add($(item));
				}
			});

			var containerPageAttribute = element.find(`[page="` + pageName + `"]`);

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
			else if(page.action == "commit") {
				element.append(page.htmlElement);
			}
			else if(page.action == "group") {
				element.html(page.htmlElement);

				var containerPage: Page = singlefin.pages[page.container];

				containerPage.appendStyles();
				containerPage.appendScripts();
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
        
		closeItems(singlefin: Singlefin, page: any, parameters: any) {
			return new Promise<void>((resolve, reject) => {
				if(page.group.length > 0) {
					page.groupIndex = 0;
				}
				
				this.closeChildren(singlefin, page.replace, parameters).then(() => {
					return this.closeChildren(singlefin, page.append, parameters);
				}, (ex) => {
					if(ex) {
						console.error("close items error");

						reject("close items error");
					}
					else {
						resolve();
					}
				}).then(() => {
					return this.closeChildren(singlefin, page.commit, parameters);
				}, (ex) => {
					if(ex) {
						console.error("close items error");

						reject("close items error");
					}
					else {
						resolve();
					}
				}).then(() => {
					return this.closeChildren(singlefin, page.group, parameters);
				}, (ex) => {
					if(ex) {
						console.error("close items error");

						reject("close items error");
					}
					else {
						resolve();
					}
				}).then(() => {
					resolve();
				}, (ex) => {
					if(ex) {
						console.error("close items error");

						reject("close items error");
					}
					else {
						resolve();
					}
				});
			});
        }
        
		closeChildren(singlefin: Singlefin, children: any, parameters: any) {
			return new Promise<void>(async (resolve, reject) => {
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
						
					}, (ex) => {
						console.error("close children error");
					});
				}

				resolve();
			});
		}
    }
}