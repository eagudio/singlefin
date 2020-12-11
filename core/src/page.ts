
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
        private _list: string;
        private _events: string[];
		private _parameters: any;
		private _isWidget: boolean;
		private _styles: string[];
		private _scripts: string[];
		private _models: any;
		private _htmlElement: any;

        private _groupIndex: number = 0;
        private _groupNextStepEnabled: boolean = true;
		private _groupPreviousStepEnabled: boolean = true;

		private _binding: Binding = new Binding();
        

        constructor(app: App, name: string, disabled: boolean, action: string, container: string, path: string, view: any, controllers: any[], replace: any[], append: any[], group: any[], unwind: any[], list: string, events: string[], parameters: any, isWidget: boolean, styles: string[], scripts: string[], models: any) {
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

        public get list(): string {
            return this._list;
        }
        
        public set list(value: string) {
            this._list = value;
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

        draw(singlefin: Singlefin, parameters: any) {
			return new Promise((resolve, reject) => {
				/*if(this.action == "replace") {
					this.removeStyles();
				}*/

				this.drawBody(singlefin, parameters).then(() => {
					this.drawContainer(singlefin, this, this.container, parameters).then((htmlContainerElement: any) => {
						this.fireModelEvent(singlefin, "open", this, parameters).then(() => {
							this.loadController(singlefin, this, parameters).then((viewParameters: any) => {
								this.htmlElement = this.renderView(singlefin, this, viewParameters);
		
								this.addEventsHandlers(singlefin, this.app, this, this.htmlElement, viewParameters);
								this.bind(singlefin, this.htmlElement);
								
								this.drawItems(singlefin, this, viewParameters).then(() => {
									this.addHtmlElement(htmlContainerElement, this, singlefin);

									this.showPage(singlefin, this, viewParameters).then(() => {
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
        
        redraw(singlefin: Singlefin, parameters: any) {
			return new Promise((resolve, reject) => {
				this.drawContainer(singlefin, this, this.container, parameters).then((htmlContainerElement: any) => {
					this.reloadController(singlefin, this, parameters).then((viewParameters: any) => {
						var previousPageHtmlElement = this.htmlElement;

						this.htmlElement = this.renderView(singlefin, this, viewParameters);

						this.addEventsHandlers(singlefin, this.app, this, this.htmlElement, viewParameters);
						this.bind(singlefin, this.htmlElement);
						
						this.drawItems(singlefin, this, viewParameters).then(() => {
							previousPageHtmlElement.replaceWith(this.htmlElement);

							this.showPage(singlefin, this, viewParameters).then(() => {
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

		nextStep(singlefin: Singlefin, parameters: any) {
			var currentPage = this.getCurrentGroupPage(singlefin);
			
			this.groupIndex = this.groupIndex + 1;
			
			if(this.groupIndex >= this.group.length) {
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

		previousStep(singlefin: Singlefin, parameters: any) {
			var currentPage = this.getCurrentGroupPage(singlefin);
			
			this.groupIndex = this.groupIndex - 1;
			
			if(this.groupIndex < 0) {
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

		openGroupPageByIndex(singlefin: Singlefin, index: number, parameters: any) {
			this.groupIndex = index;
			
			if(this.groupIndex < 0) {
				this.groupIndex = 0;
			}

			if(this.groupIndex >= this.group.length) {
				this.groupIndex = this.group.length - 1;
			}

			return this.redraw(singlefin, parameters);
		}

		openGroupPage(singlefin: Singlefin, pageName: string, parameters: any) {
			var groupIndex = this.group.indexOf(pageName);

			if(groupIndex == -1) {
				console.error("group page " + pageName + " not found");
					
				Promise.reject("group page " + pageName + " not found");
			}

			this.groupIndex = groupIndex;

			return this.redraw(singlefin, parameters);
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
				this.fireModelEvent(singlefin, "open", body, parameters).then(() => {
					this.loadController(singlefin, body, parameters).then(async (viewParameters: any) => {
						body.htmlElement = $("#" + body.name);
						
						body.appendStyles();
						body.appendScripts();
	
						var view = this.renderView(singlefin, body, viewParameters);
	
						body.htmlElement.append(view);
		
						resolve(body.htmlElement);
					}, (ex: any) => {
						if(ex) {
							console.error("draw body error");
	
							reject("draw body error");
						}
						else {
							resolve($(``));
						}
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
        
		drawContainer(singlefin: Singlefin, page: any, containerName: string, parameters: any) {
			var container: Page = singlefin.pages[containerName];

			if(!container) {
                console.error("container page '" + containerName + "' not found");

				return Promise.reject("container page '" + containerName + "' not found");
			}
			
			if(!container.htmlElement) {
				return this.drawParent(singlefin, page, containerName, parameters);
			}

			return Promise.resolve(container.htmlElement);
        }
        
		drawItems(singlefin: Singlefin, parentPage: any, parameters: any) {
			return new Promise(async (resolve, reject) => {
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
			});
        }
        
		drawParent(singlefin: Singlefin, page: any, pageName: string, parameters: any) {
			return new Promise((resolve, reject) => {
				if(pageName == singlefin.body) {
					return resolve(singlefin.getBody().htmlElement);
				}
				
				var parentPage = singlefin.pages[pageName];
	
				if(!parentPage) {
                    console.error("page not found");

					return reject("page not found");
				}
				
				this.drawContainer(singlefin, page, parentPage.container, parameters).then((htmlContainerElement) => {
					this.fireModelEvent(singlefin, "open", parentPage, parameters).then(() => {
						this.loadController(singlefin, parentPage, parameters).then(async (viewParameters: any) => {
							parentPage.htmlElement = this.renderView(singlefin, parentPage, viewParameters);
	
							this.addEventsHandlers(singlefin, parentPage.app, parentPage, htmlContainerElement, viewParameters);
							parentPage.bind(singlefin, htmlContainerElement);
							
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
        
		drawChildren(singlefin: Singlefin, parent: any, children: any[], parameters: any) {
			return new Promise(async (resolve, reject) => {
				if(!children) {
					return resolve();
				}
				
				for(var i=0; i<children.length; i++) {
					var childPageName = children[i];
                    var childPage = singlefin.pages[childPageName];

					if(childPage.action == "group") {
						if(parent.groupIndex != i) {
							continue;
						}
					}

					if(childPage.disabled == true) {
						continue;
					}

					await this.fireModelEvent(singlefin, "open", childPage, parameters).then(async () => {
						await this.loadController(singlefin, childPage, parameters).then(async (viewParameters: any) => {
							if(childPage.action == "unwind") {
								await this.unwindItems(singlefin, parent, childPageName, childPage, viewParameters, parameters).then(async () => {
									
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
								childPage.bind(singlefin, childPage.htmlElement);
	
								this.addHtmlElement(parent.htmlElement, childPage, singlefin);
	
								await this.drawItems(singlefin, childPage, viewParameters).then(async () => {
									await this.showPage(singlefin, childPage, viewParameters).then(() => {
	
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
        
		unwindItems(singlefin: Singlefin, parent: any, pageName: string, page: Page, parameters: any, controllerParameters: any) {
			return new Promise(async (resolve, reject) => {
				var list = parameters;

				if(page.list) {
					list = ModelObject.getValue(singlefin.models, page.list);
				}

                if(!Array.isArray(list)) {
                    console.error("unwind error page '" + pageName + "': controller must return an array");
                    
                    return reject("unwind error page '" + pageName + "': controller must return an array");
				}

				//TODO: rimuovere i surrogati per liberare memoria e gli eventi!?

				for(var i=0; i<list.length; i++) {
                    var surrogate: Page = singlefin.addSurrogate(page.name + "#" + i, pageName + "/" + page.name + "#" + i, page.container, page);

					await this.resolveUnwindItem(singlefin, surrogate, list[i], controllerParameters).then(async (viewParameters: any) => {
						surrogate.htmlElement = this.renderView(singlefin, surrogate, viewParameters);

						this.addEventsHandlers(singlefin, page.app, surrogate, surrogate.htmlElement, viewParameters);
						surrogate.bind(singlefin, surrogate.htmlElement);

						await this.drawItems(singlefin, surrogate, viewParameters).then(async () => {
							this.addHtmlElement(parent.htmlElement, surrogate, singlefin);
							
							parent.bind(singlefin, parent.htmlElement);
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

				resolve();
			});
		}
        
		loadController(singlefin: Singlefin, page: any, parameters: any) {
			return new Promise(async (resolve, reject) => {
			
				if(!page.controllers) {
					return resolve(parameters);
				}

				var result = parameters;
                
				for(var i=0; i<page.controllers.length; i++) {
					if(page.controllers[i].load) {
						await page.controllers[i].load(singlefin, page, result).then(async (_result: any) => {
							result = _result;
						}, (ex: any) => {
							if(ex) {
								console.error("load controller error: " + ex);
							}
							
							reject(ex);
						});
					}
				}

				resolve(result);
			});
		}
		
		fireModelEvent(singlefin: Singlefin, event: string, page: any, parameters: any) {
			return new Promise(async (resolve, reject) => {
				if(!page.events) {
					return resolve();
				}

				var events = page.events[event];

				if(!events) {
					return resolve();
				}
                
				for(var i=0; i<events.length; i++) {
					var modelMethod = ModelObject.getValue(singlefin.models, events[i]);

					await modelMethod(page.app, singlefin.models, parameters).then(async () => {
							
					}, (ex: any) => {
						if(ex) {
							console.error("load controller error: " + ex);
						}
						
						reject(ex);
					});
				}

				resolve();
			});
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

			var htmlElement = $(html);

			return htmlElement;
		}

		bind(singlefin: Singlefin, htmlElement: any) {
			this._binding = new Binding();

			this._binding.bind(this, htmlElement, singlefin.modelProxy);
		}

		showPage(singlefin: Singlefin, page: Page, parameters: any) {
			return new Promise(async (resolve, reject) => {
				if(!page.controllers) {
					return resolve(parameters);
				}

				var result = parameters;
                
				for(var i=0; i<page.controllers.length; i++) {
					if(page.controllers[i].show) {
						await page.controllers[i].show(singlefin, page, result).then(async (_result: any) => {
							result = _result;
						}, (ex: any) => {
							if(ex) {
								console.error("show page error: " + ex);
							}
							
							reject(ex);
						});
					}
				}

				resolve(result);
			});
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
        
		resolveUnwindItem(singlefin: Singlefin, page: Page, parameters: any, controllerParameters: any) {
			return new Promise(async (resolve, reject) => {
			
				if(!page.controllers) {
					return resolve(parameters);
				}

				var result = parameters;
				
				for(var i=0; i<page.controllers.length; i++) {					
					if(page.controllers[i].unwind) {
						await page.controllers[i].unwind(singlefin, page, result, controllerParameters).then(async (_result: any) => {
							result = _result;
						}, (ex: any) => {
                            console.error("resolve unwind item error: " + ex);

							reject("resolve unwind item error: " + ex);
						});
					}
				}

				resolve(result);
			});
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

								for(var z=0; z<page.controllers.length; z++) {
									var controller = page.controllers[z];
									var method = controller[handler];

									if(method) {
										this.addEventHandler(singlefin, app, page, page, page.path, element, event, method, parameters);
									}
								}

								for(var p=0; p<paths.length; p++) {
									var handlerPage: Page = singlefin.pages[paths[p]];

									for(var c=0; c<handlerPage.controllers.length; c++) {
										if(handlerPage.controllers[c][handler]) {
											this.addEventHandler(singlefin, app, handlerPage, page, paths[p], element, event, handlerPage.controllers[c][handler], parameters);
										}
									}
								}
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
        
		addEventHandler(singlefin: Singlefin, app: App, handlerPage: Page, page: Page, path: string, htmlElement: any, eventType: any, handler: any, data: any) {
			htmlElement.on(eventType, {
				app: singlefin,
				event: eventType,
				handler: handler,
				data: data,
				path: path,
				page: page,
				target: handlerPage,
				htmlElement: htmlElement
			}, (event: any) => {
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
        
		close(singlefin: Singlefin, parameters: any) {
			return new Promise((resolve, reject) => {
				this.closeItems(singlefin, this, parameters).then(() => {
					this.closeController(this, parameters).then(() => {
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