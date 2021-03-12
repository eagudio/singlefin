module SinglefinModule {
    export class EventManager {
        addEventsHandlers(singlefin: Singlefin, app: App, page: Page, element: any, parameters: any, pageModels: any) {
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

								this.addHandleEvent(singlefin, element, event, handler, page, parameters, pageModels);
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
				this.addEventsHandlers(singlefin, app, page, $(item), parameters, pageModels);
			});
        }

        addHandleEvent(singlefin: Singlefin, htmlElement: any, eventType: string, event: string, page: any, parameters: any, pageModels: any) {
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
				pageModels: pageModels
			}, (event: any) => {
				var eventData = event.data;

                var _page: Page = eventData.page;

				_page.eventManager.handleEvent(singlefin, eventData.page.events, eventData.event, eventData.page, eventData.data, eventData.pageModels, event);
			});
		}
		
		handleEvent(singlefin: Singlefin, events: any, event: any, page: Page, parameters: any, pageModels: any, eventObject?: any) {
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
					await this.handleAction(singlefin, eventsList[i], page, parameters, result, pageModels, eventObject).then((_result: any) => {
						result = _result;
					}).catch((ex: any) => {
						return reject(ex);
					});
				}

				resolve(result);
			});
		}

		handleAction(singlefin: Singlefin, action: any, page: Page, parameters: any, _result: any, pageModels: any, eventObject?: any) {
			return new Promise((resolve, reject) => {
				var result = _result;
				
				this.handleControllerEvent(singlefin, action, page, parameters, pageModels, eventObject).then(async (_result: any) => {
					result = _result;
	
					return this.handleModelEvent(singlefin, action, page, parameters, pageModels, eventObject);
				}).then(() => {
					return this.handlePageEvent(singlefin, action, page, parameters, pageModels, eventObject);
				}).then(() => {
					return this.handleGroupEvent(singlefin, action, page, parameters, pageModels, eventObject);
				}).then(() => {
					return this.handleEventEvent(singlefin, action, page, parameters, pageModels, eventObject);
				}).then(() => {
					return this.handleRequestEvent(singlefin, action, page, parameters, pageModels, eventObject);
				}).then(() => {
					return this.handleBrowserEvent(singlefin, action, page, parameters, pageModels, eventObject);
				}).then(() => {
					resolve(result);
				}).catch((ex: any) => {
					reject("page '" + page.name + "' handle event error: " + ex);
				});
			});
		}

		handleControllerEvent(singlefin: Singlefin, delegate: any, page: Page, parameters: any, pageModels: any, event?: any) {
			return new Promise(async (resolve, reject) => {
				var result = parameters;

				if(!delegate.controller) {
					return resolve(result);
				}
	
				for(var i=0; i<page.controllers.length; i++) {
					var controller = page.controllers[i];
					var controllerMethod = controller[delegate.controller];
	
					if(controllerMethod) {
						var promise = controllerMethod.call(controller, page.app, page, singlefin.models, parameters, event);

						if(promise) {
							await promise.then((_result: any) => {
								result = _result;
							}, (ex: any) => {
								console.error("page '" + page.name +  "' handle controller error: " + ex);
								
								return reject(ex);
							});
						}
					}
				}
	
				resolve(result);
			});
		}

		handleModelEvent(singlefin: Singlefin, delegate: any, page: Page, parameters: any, pageModels: any, event?: any) {
			return new Promise<void>((resolve, reject) => {
				if(!delegate.model) {
					return resolve();
				}
	
				if(pageModels) {
					var modelMethodName = Runtime.getPropertyName(delegate.model);
	
					if(pageModels[modelMethodName]) {
						var pageModelMethodName = pageModels[modelMethodName].ref;
						
						if(!pageModelMethodName) {
							this.handleEvent(singlefin, pageModels[modelMethodName], "on", page, parameters, pageModels).then(() => {
								return resolve();
							}).catch((ex: any) => {
								return reject(ex);
							});
						}
						else {
							var model = Runtime.getParentInstance(singlefin.models, pageModelMethodName);
							var modelMethod = Runtime.getProperty(singlefin.models, pageModelMethodName);
	
							modelMethod.call(model, page.app, page, singlefin.models, parameters, event).then(() => {
								if(!pageModels[modelMethodName].on) {
									return resolve();
								}
								
								this.handleEvent(singlefin, pageModels[modelMethodName], "on", page, parameters, pageModels).then(() => {
									return resolve();
								}).catch((ex: any) => {
									return reject(ex);
								});
							}).catch((ex: any) => {
								return reject(ex);
							});
						}
					}
				}
	
				var model = Runtime.getParentInstance(singlefin.models, delegate.model);
				var modelMethod = Runtime.getProperty(singlefin.models, delegate.model);

				modelMethod.call(model, page.app, page, singlefin.models, parameters, event).then(() => {
					return resolve();
				}).catch((ex: any) => {
					return reject(ex);
				});
			});
		}

		handlePageEvent(singlefin: Singlefin, delegate: any, page: Page, parameters: any, pageModels: any, event?: any) {
			return new Promise<void>((resolve, reject) => {
				if(!delegate.page) {
					return resolve();
				}

				var pageModels: any = {};

				for(var key in delegate.page.models) {
					pageModels[key] = {};

					var valuePath = delegate.page.models[key].ref

					if(valuePath) {
						valuePath = valuePath.replace(".$", "[" + page.index + "]");
						valuePath = valuePath.trim();
					}

					pageModels[key].ref = valuePath;
					pageModels[key].on = delegate.page.models[key].on;
				}

				if(delegate.page.open) {
					singlefin.open(delegate.page.open, delegate.page.parameters, pageModels).then(() => {
						return resolve();
					});
				}
				else if(delegate.page.refresh) {
					singlefin.refresh(delegate.page.refresh, delegate.page.parameters, pageModels).then(() => {
						return resolve();
					});
				}
				else if(delegate.page.close) {
					singlefin.close(delegate.page.close, delegate.page.parameters).then(() => {
						return resolve();
					});
				}
				else {
					reject("method '" + delegate.page + "' not supported");
				}
			});
		}

		handleGroupEvent(singlefin: Singlefin, delegate: any, page: Page, parameters: any, pageModels: any, event?: any) {
			return new Promise<void>((resolve, reject) => {
				if(!delegate.group) {
					return resolve();
				}
				
				if(delegate.group.open) {
					singlefin.openGroupPage(delegate.group.open, delegate.group.page, delegate.group.parameters, delegate.group.models).then(() => {
						return resolve();
					}).catch((ex: any) => {
						return reject(ex);
					});
				}

				if(delegate.group.reset) {
					singlefin.resetGroupPage(delegate.group.reset);

					return resolve();
				}
			});
		}

		handleEventEvent(singlefin: Singlefin, delegate: any, page: Page, parameters: any, pageModels: any, eventObject: any) {
			return new Promise<void>((resolve, reject) => {
				if(!delegate.event) {
					return resolve();
				}

				if(delegate.event.preventDefault == true) {
					eventObject.preventDefault();

					if(!delegate.event.delegate) {
						return resolve();
					}
				}

				if(!delegate.event.delegate) {
					return reject("method '" + delegate.event + "' not supported");
				}
				
				this.handleEvent(singlefin, page.events, delegate.event.delegate, page, parameters, pageModels).then(() => {
					return resolve();
				}).catch((ex: any) => {
					return reject(ex);
				});
			});
		}

		handleRequestEvent(singlefin: Singlefin, delegate: any, page: Page, parameters: any, result: any, pageModels: any, eventObject?: any) {
			return new Promise<void>((resolve, reject) => {
				if(!delegate.request) {
					return resolve();
				}

				var request: Request = new Request(delegate.request);

				request.call(singlefin, page, singlefin.models, result, pageModels).then(() => {
					resolve();
				}).catch((ex: any) => {
					reject(ex);
				});
			});
		}

		handleBrowserEvent(singlefin: Singlefin, delegate: any, page: Page, parameters: any, result: any, pageModels: any, eventObject?: any) {
			if(!delegate.browser) {
				return Promise.resolve();
			}

			if(delegate.browser == "refresh") {
				window.location.reload();
			}

			return Promise.resolve();
		}
    }
}