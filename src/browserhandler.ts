module BrowserModule {
    export class BrowserHandler {
        private _browser: Browser;
        

        constructor(_browser: Browser) {
            this._browser = _browser;
        }

		draw(page: Page, parameters: any) {
			return new Promise((resolve, reject) => {
				this.drawBody(parameters).then(() => {
					this.drawContainer(page, page.container, parameters).then((htmlContainerElement: any) => {
						this.loadController(page, parameters).then((viewParameters: any) => {
							page.htmlElement = this.renderView(page, viewParameters);
	
							this.addEventsHandlers(page, page.htmlElement, viewParameters);
							
							this.drawItems(page, viewParameters).then(() => {
								this.addHtmlElement(htmlContainerElement, page);

								this.showPage(page, viewParameters);
	
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
        
        redraw(page: Page, parameters: any) {
			return new Promise((resolve, reject) => {
				this.drawContainer(page, page.container, parameters).then((htmlContainerElement: any) => {
					this.reloadController(page, parameters).then((viewParameters: any) => {
						var previousPageHtmlElement = page.htmlElement;

						page.htmlElement = this.renderView(page, viewParameters);

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
		
		nextStep(page: Page, parameters: any) {
			page.groupIndex = page.groupIndex + 1;

			return this.redraw(page, parameters);
		}
        
		drawBody(parameters: any) {
			var body = this._browser.pages[this._browser.body];
			
			if(body.htmlElement) {
				return Promise.resolve(body.htmlElement);
			}

			return new Promise((resolve, reject) => {
				this.loadController(body, parameters).then(async (viewParameters: any) => {
					body.htmlElement = this.renderView(body, viewParameters);
	
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
					return this.drawChildren(parentPage, parentPage.append, parameters);
				}, () => {
					console.error("replace items error");

					reject("replace items error");
				}).then(() => {
					return this.drawChildren(parentPage, parentPage.group, parameters);
				}, () => {
					console.error("append items error");

					reject("append items error");
				}).then(() => {
					return this.drawChildren(parentPage, parentPage.unwind, parameters);
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
						parentPage.htmlElement = this.renderView(parentPage, viewParameters);

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

					if(childPage.action == "group") {
						if(parent.groupIndex != i) {
							continue;
						}
					}

					await this.loadController(childPage, parameters).then(async (viewParameters: any) => {
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
							childPage.htmlElement = this.renderView(childPage, viewParameters);

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

					await this.resolveUnwindItem(surrogate, parameters[i]).then(async (viewParameters: any) => {
						surrogate.htmlElement = this.renderView(page, viewParameters);

						this.addEventsHandlers(surrogate, surrogate.htmlElement, viewParameters);

						await this.drawItems(surrogate, viewParameters).then(async () => {
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
			var bodyRegexp = new RegExp("^(" + this._browser.body + "/)");
			var container = page.container.replace(bodyRegexp, "");
			
			var surrogate = {
				name: name,
				action: page.action,
				path: container + "/" + name,
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
		
		renderView(page: any, viewParameters: any) {
			if(page.view) {
				var html = this.resolveMarkup(page.view, {
					data: viewParameters,
					parameters: page.parameters,
					resources: this._browser.defaultResources
				});

				return $(html);
			}

			return $();
		}

		showPage(page: any, parameters: any) {
			return new Promise(async (resolve, reject) => {
			
				if(!page.controllers) {
					return resolve(parameters);
				}

				var result = parameters;
                
				for(var i=0; i<page.controllers.length; i++) {
					if(page.controllers[i].show) {
						await page.controllers[i].show(page, result).then(async (_result: any) => {
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

		resolveMarkup(markup: string, context: any) {
            try {
                var markupRegex = /[<][%]([a-zA-z0-9.,;:\+\-\*><=!?|&"'(){}\/\s]{1,})[%][>]/m;
				
				var str = markup;

				var match = markupRegex.exec(str);
				
				while(match) {
					var result: any = null;
                
					var code = "(() => {" +
						"result = " + match[1] + ";" +
					"})()";
					
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
				//browserTag.parent().append(page.htmlElement);
				browserTag.before(page.htmlElement);

				return;
			}

			if(page.action == "replace") {
				container.html(page.htmlElement);
			}
			else if(page.action == "append") {
				container.append(page.htmlElement);
			}
			else if(page.action == "group") {
				container.html(page.htmlElement);
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
        
		close(page: Page, parameters: any) {
			return new Promise((resolve, reject) => {
				this.closeItems(page, parameters).then(() => {
					this.closeController(page, parameters).then(() => {
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
        
		closeItems(page: any, parameters: any) {
			return new Promise((resolve, reject) => {
				this.closeChildren(page.replace, parameters).then(() => {
					this.closeChildren(page.append, parameters).then(() => {
						this.closeChildren(page.unwind, parameters).then(() => {
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
        
		closeChildren(children: any, parameters: any) {
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

					await this.closeItems(page, parameters).then(async () => {
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