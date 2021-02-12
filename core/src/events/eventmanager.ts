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
				
				this.handleControllerEvent(singlefin, action, page, parameters, eventObject).then(async (_result: any) => {
					result = _result;
	
					return this.handleModelEvent(singlefin, action, page, parameters, pageModels);
				}).then(() => {
					return this.handlePageEvent(singlefin, action);
				}).then(() => {
					return this.handleGroupEvent(singlefin, action);
				}).then(() => {
					return this.handleEventEvent(singlefin, action, page, parameters, pageModels);
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

		handleModelEvent(singlefin: Singlefin, delegate: any, page: Page, parameters: any, pageModels: any) {
			if(!delegate.model) {
				return Promise.resolve();
			}

			if(pageModels) {
				var modelMethodName = Runtime.getPropertyName(delegate.model);

				if(pageModels[modelMethodName]) {
					var pageModelMethodName = pageModels[modelMethodName].binding;
					
					var model = Runtime.getParentInstance(singlefin.models, pageModelMethodName);
					var modelMethod = Runtime.getProperty(singlefin.models, pageModelMethodName);

					return modelMethod.call(model, page.app, singlefin.models, parameters);
				}
			}

			var model = Runtime.getParentInstance(singlefin.models, delegate.model);
			var modelMethod = Runtime.getProperty(singlefin.models, delegate.model);

			return modelMethod.call(model, page.app, singlefin.models, parameters);
		}

		handlePageEvent(singlefin: Singlefin, delegate: any) {
			return new Promise<void>((resolve, reject) => {
				if(!delegate.page) {
					return resolve();
				}

				if(delegate.page.open) {
					singlefin.open(delegate.page.open, delegate.page.parameters, delegate.page.models).then(() => {
						return resolve();
					});
				}
				else if(delegate.page.refresh) {
					singlefin.refresh(delegate.page.refresh, delegate.page.parameters, delegate.page.models).then(() => {
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

		handleGroupEvent(singlefin: Singlefin, delegate: any) {
			if(!delegate.group) {
				return Promise.resolve();
			}

			if(delegate.group.open) {
				return singlefin.openGroupPage(delegate.group.open, delegate.group.page, delegate.group.parameters, delegate.group.models);
			}
			
			return Promise.reject("method '" + delegate.page + "' not supported");
		}

		handleEventEvent(singlefin: Singlefin, delegate: any, page: Page, parameters: any, pageModels: any) {
			if(!delegate.event) {
				return Promise.resolve();
			}

			if(delegate.event.delegate) {
				return this.handleEvent(singlefin, page.events, delegate.event.delegate, page, parameters, pageModels);
			}
			
			return Promise.reject("method '" + delegate.page + "' not supported");
		}

		handleRequestEvent(singlefin: Singlefin, delegate: any, page: Page, parameters: any, result: any, pageModels: any, eventObject?: any) {
			if(!delegate.request) {
				return Promise.resolve();
			}

			var request: Request = delegate.request.handler;

			return request.call(singlefin, page, singlefin.models, result, pageModels);
		}

		handleBrowserEvent(singlefin: Singlefin, delegate: any, page: Page, parameters: any, result: any, pageModels: any, eventObject?: any) {
			if(!delegate.browser) {
				return Promise.resolve();
			}

			if(delegate.browser == "refresh") {
				window.location.href = window.location.href;
			}
		}
    }
}