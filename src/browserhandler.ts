module BrowserModule {
    export class BrowserHandler {
        private _browser: Browser;
        

        constructor(_browser: Browser) {
            this._browser = _browser;
        }

        draw(pageName: string, parameters: any) {
			return new Promise((resolve, reject) => {
				this.drawBody(parameters).then(() => {
					if(pageName == this._browser.body) {
						return resolve(this._browser.pages.__body.htmlElement);
					}
					
					var page = this._browser.pages[pageName];
		
					if(!page) {
                        console.error("page not found");
                        
                        return reject("page not found");
					}
	
					this.drawContainer(page, page.container, parameters).then((htmlContainerElement: any) => {
						this.loadController(page, parameters).then((viewParameters: any) => {
							if(!page.view.render) {
                                console.error("an error occurred during render view: page method render missing");

								return reject("an error occurred during render view: page method render missing");
							}
	
							page.htmlElement = page.view.render(viewParameters, this._browser.defaultResources);
	
							this.addEventsHandlers(page, page.htmlElement, viewParameters);
							
							this.drawItems(page, viewParameters).then(() => {
								this.addHtmlElement(htmlContainerElement, page);
	
								resolve(page.htmlElement);
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
        
        redraw(pageName: string, parameters: any) {
			return new Promise((resolve, reject) => {
				if(pageName == this._browser.body) {
					return resolve(this._browser.pages.__body.htmlElement);
				}
				
				var page = this._browser.pages[pageName];
	
				if(!page) {
                    console.error("page not found");
                    
                    return reject("page not found");
				}

				this.drawContainer(page, page.container, parameters).then((htmlContainerElement: any) => {
					this.reloadController(page, parameters).then((viewParameters: any) => {
						if(!page.view.render) {
                            console.error("an error occurred during render view: page method render missing");
                    
                            return reject("an error occurred during render view: page method render missing");
						}

						var previousPageHtmlElement = page.htmlElement;

						page.htmlElement = page.view.render(viewParameters, this._browser.defaultResources);

						this.addEventsHandlers(page, page.htmlElement, viewParameters);
						
						this.drawItems(page, viewParameters).then(() => {
							previousPageHtmlElement.replaceWith(page.htmlElement);

							resolve(page.htmlElement);
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
        
		drawBody(parameters: any) {
			var body = this._browser.pages[this._browser.body];
			
			if(body.htmlElement) {
				return Promise.resolve(body.htmlElement);
			}

			return new Promise((resolve, reject) => {
				this.loadController(body, parameters).then(async (viewParameters: any) => {
					if(!body.view.render) {
                        console.error("an error occurred during render view: page method render missing");

                        return reject("an error occurred during render view: page method render missing");
					}
	
					body.htmlElement = body.view.render(viewParameters, this._browser.defaultResources);
	
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
			});
        }
        
		drawContainer(page: any, containerName: string, parameters: any) {
			var container = this._browser.pages[containerName];

			if(!container) {
                console.error("container page '" + containerName + "' not found");

				return Promise.reject("container page '" + containerName + "' not found");
			}
			
			if(!container.htmlElement) {
				return this.drawParent(page, containerName, parameters);
			}

			return Promise.resolve(container.htmlElement);
        }
        
		drawItems(parentPage: any, parameters: any) {
			return new Promise(async (resolve, reject) => {
				this.drawChildren(parentPage, parentPage.replace, parameters).then(() => {
					this.drawChildren(parentPage, parentPage.append, parameters).then(() => {
						this.drawChildren(parentPage, parentPage.unwind, parameters).then(() => {
							resolve();
						}, (ex: any) => {
							if(ex) {
                                console.error("draw items error");

								reject("draw items error");
							}
							else {
								resolve();
							}
						});
					}, (ex: any) => {
						if(ex) {
							console.error("draw items error");

							reject("draw items error");
						}
						else {
							resolve();
						}
					});
				}, (ex: any) => {
					if(ex) {
						console.error("draw items error");

						reject("draw items error");
					}
					else {
						resolve();
					}
				});
			});
        }
        
		drawParent(page: any, pageName: string, parameters: any) {
			return new Promise((resolve, reject) => {
				if(pageName == this._browser.body) {
					return resolve(this._browser.pages.__body.htmlElement);
				}
				
				var parentPage = this._browser.pages[pageName];
	
				if(!parentPage) {
                    console.error("page not found");

					return reject("page not found");
				}
				
				this.drawContainer(page, parentPage.container, parameters).then((htmlContainerElement) => {
					if(!page.models) {
						page.models = parentPage.models;
					}

					this.loadController(parentPage, parameters).then(async (viewParameters: any) => {
						if(!parentPage.view.render) {
                            console.error("an error occurred during render view: page method render missing");

					        return reject("an error occurred during render view: page method render missing");
						}

						parentPage.htmlElement = parentPage.view.render(viewParameters, this._browser.defaultResources);

						this.addEventsHandlers(parentPage, htmlContainerElement, viewParameters);
						
						this.addHtmlElement(htmlContainerElement, parentPage);

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
        
		drawChildren(parent: any, children: any[], parameters: any) {
			return new Promise(async (resolve, reject) => {
				if(!children) {
					return resolve();
				}
				
				for(var i=0; i<children.length; i++) {
					var childPageName = children[i];
					var childPage = this._browser.pages[childPageName];

					if(!childPage.models) {
						childPage.models = parent.models;
					}

					await this.loadController(childPage, parameters).then(async (viewParameters: any) => {
						if(!childPage.view.render) {
                            console.error("draw children error: page method render missing");

							return reject("draw children error: page method render missing");
						}
						
						if(childPage.action == "unwind") {
							await this.unwind(parent, childPageName, childPage, viewParameters).then(async () => {
								
							}, (ex) => {
								if(ex) {
                                    console.error("draw children error");

									return reject("draw children error");
								}
							});
						}
						else {
							childPage.htmlElement = childPage.view.render(viewParameters, this._browser.defaultResources);

							this.addEventsHandlers(childPage, childPage.htmlElement, viewParameters);

							this.addHtmlElement(parent.htmlElement, childPage);

							await this.drawItems(childPage, viewParameters).then(async () => {
								
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
        
		unwind(parent: any, pageName: string, page: any, parameters: any) {
			return new Promise(async (resolve, reject) => {
                if(!Array.isArray(parameters)) {
                    console.error("unwind error page '" + pageName + "': controller must return an array");
                    
                    return reject("unwind error page '" + pageName + "': controller must return an array");
				}

				//TODO: rimuovere i surrogati per liberare memoria e gli eventi!?

				for(var i=0; i<parameters.length; i++) {
					var surrogate = this.addSurrogate(pageName + "/" + page.name + "#" + i, page.name + "#" + i, page);

					await this.resolveUnwindItem(surrogate, parameters[i]).then(async (viewParameter: any) => {
						surrogate.htmlElement = page.view.render(viewParameter, this._browser.defaultResources);

						this.addEventsHandlers(surrogate, surrogate.htmlElement, viewParameter);

						await this.drawItems(surrogate, viewParameter).then(async () => {
							this.addHtmlElement(parent.htmlElement, surrogate);
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

        addSurrogate(path: string, name: string, page: any) {
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
        
		createSurrogates(path: string, pagesPath: string[]) {
			var surrogates = [];
			
			for(var i=0; i<pagesPath.length; i++) {
				var page = this._browser.pages[pagesPath[i]];

				surrogates.push(path + "/" + page.name);

				this.addSurrogate(path + "/" + page.name, page.name, page);
			}

			return surrogates;
        }
        
		removeSurrogates(prefixPagePath: string) {			
			for (var key in this._browser.surrogates) {
				if(key.startsWith(prefixPagePath)) {
					delete this._browser.surrogates[key];
				}
			}
		}
        
		loadController(page: any, parameters: any) {
			return new Promise(async (resolve, reject) => {
			
				if(!page.controllers) {
					return resolve(parameters);
				}

				var result = parameters;
                
				for(var i=0; i<page.controllers.length; i++) {
                    await page.controllers[i].load(page, result).then(async (_result: any) => {
						result = _result;
					}, (ex: any) => {
                        if(ex) {
                            console.error("load controller error: " + ex);
                        }
                        
                        reject(ex);
					});
				}

				resolve(result);
			});
        }
        
		reloadController(page: any, parameters: any) {			
			return new Promise(async (resolve, reject) => {
				if(!page.controllers) {
					return resolve(parameters);
				}

				var result = parameters;
				
				for(var i=0; i<page.controllers.length; i++) {					
					if(page.controllers[i].reload) {
						await page.controllers[i].reload(page, result).then(async (_result: any) => {
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
        
		resolveUnwindItem(page: any, parameters: any) {
			return new Promise(async (resolve, reject) => {
			
				if(!page.controllers) {
					return resolve(parameters);
				}

				var result = parameters;
				
				for(var i=0; i<page.controllers.length; i++) {					
					if(page.controllers[i].unwind) {
						await page.controllers[i].unwind(page, result).then(async (_result: any) => {
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
        
		addHtmlElement(container: any, page: any) {			
			var pageName = page.name.split('#')[0];
			var browserTag = container.find("browser[" + pageName +"]");
			
			if(browserTag.length > 0) {
				browserTag.parent().append(page.htmlElement);

				return;
			}

			if(page.action == "replace") {
				container.html(page.htmlElement);
			}
			else if(page.action == "append") {
				container.append(page.htmlElement);
			}
			else if(page.action == "unwind") {
				container.append(page.htmlElement);
			}
        }
        
		addEventsHandlers(page: any, element: any, parameters: any) {
			if(!element) {
				return;
			}

			element.each((i: number, item: any) => {
				$.each(item.attributes, (i: number, attribute: any) => {
					if(attribute.specified) {
						if(attribute.name.startsWith("browser-")) {
							var browserAttribute = attribute.name.split("browser-");
							var event = browserAttribute[1];

							var handlerList = [];
					
							if(attribute.value) {
								handlerList = attribute.value.split(",");
							}

							for(var n=0; n<handlerList.length; n++) {
								var handler = handlerList[n];
								var paths = [];

								if(this._browser.handlers[handler]) {
									paths = this._browser.handlers[handler];
								}

								for(var p=0; p<paths.length; p++) {
									var handlerPage = this._browser.pages[paths[p]];
									
									if(handlerPage.view[handler]) {
										this.addEventHandler(handlerPage, page, paths[p], element, event, handlerPage.view[handler], parameters);
									}

									for(var c=0; c<handlerPage.controllers.length; c++) {
										if(handlerPage.controllers[c][handler]) {
											this.addEventHandler(handlerPage, page, paths[p], element, event, handlerPage.controllers[c][handler], parameters);
										}
									}
								}
							}
						}

						if(attribute.name == "href") {
							if(attribute.value.startsWith("browser#")) {
								var href = attribute.value;

								var markup = href.split("#");

								if(markup.length > 0) {
									var path = markup[1];

									element.on("click", (event: any) => {
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

			children.each((i: number, item: any) => {
				this.addEventsHandlers(page, $(item), parameters);
			});
        }
        
		addEventHandler(handlerPage: any, page: any, path: string, htmlElement: any, event: any, handler: any, data: any) {
			htmlElement.on(event, {
				event: event,
				handler: handler,
				data: data,
				path: path,
				page: page,
				target: handlerPage,
				htmlElement: htmlElement
			}, (event: any) => {
				var browserEventObject = event.data;

				//TODO: workaround: per gli elementi surrogati di unwind non si ha sempre disponibile l'htmlElement perchè in realtà viene passato l'oggetto originale (non il surrogato)
				browserEventObject.target = browserEventObject.target.htmlElement ? browserEventObject.target.htmlElement : browserEventObject.htmlElement;

				event.browser = browserEventObject;
				event.data = null;

				browserEventObject.handler(event);
			});
        }
        
		close(page: any) {
			return new Promise((resolve, reject) => {
				this.closeItems(page).then(() => {
					this.closeController(page).then(() => {
						this.closeView(page);

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
        
		closeView(page: any) {
			if(page.view.close) {
				page.view.close(page.htmlElement);
			}
        }
        
		closeController(page: any) {
			return new Promise(async (resolve, reject) => {
				if(!page.controllers) {
					return resolve();
				}

				for(var i=0; i<page.controllers.length; i++) {
					if(page.controllers[i].close) {
						await page.controllers[i].close().then(() => {

						}, (ex: any) => {
                            console.error("close controller error: " + ex);
                            
							return reject("close controller error" + ex);
						});
					}
				}

				return resolve();
			});
        }
        
		closeItems(page: any) {
			return new Promise((resolve, reject) => {
				this.closeChildren(page.replace).then(() => {
					this.closeChildren(page.append).then(() => {
						this.closeChildren(page.unwind).then(() => {
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
					}, (ex) => {
						if(ex) {
                            console.error("close itmes error");

							reject("close itmes error");
						}
						else {
							resolve();
						}
					});
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
        
		closeChildren(children: any) {
			return new Promise(async (resolve, reject) => {
				if(!children) {
					return resolve();
				}
				
				for(var i=0; i<children.length; i++) {
					var childName = children[i];

					var page = this._browser.pages[childName];

					if(!page) {
						page = this._browser.surrogates[childName];

						if(!page) {
							console.error("close children error: page '" + childName + "' not found");
						
							return resolve();
						}
					}

					await this.closeItems(page).then(async () => {
						this.closeController(page).then(() => {
							this.closeView(page);
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