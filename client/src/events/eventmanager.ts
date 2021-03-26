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

		handleAction(singlefin: Singlefin, actions: any, page: Page, parameters: any, result: any, pageModels: any, eventObject?: any) {
			return new Promise((resolve, reject) => {
				var eventHandler: EventHandler = this.makeEventHandler(actions);

				eventHandler.handle(singlefin, actions, page, parameters, pageModels, eventObject).then(async (_result: any) => {
					resolve(_result);
				}).catch((ex: any) => {
					reject("page '" + page.name + "' handle event error: " + ex);
				});
			});
		}

		makeEventHandler(actions: any): EventHandler {
			if(actions.model) {
				return new ModelEventHandler(this);
			}
			else if(actions.controller) {
				return new ControllerEventHandler(this);
			}
			else if(actions.page) {
				return new PageEventHandler(this);
			}
			else if(actions.group) {
				return new GroupEventHandler(this);
			}
			else if(actions.request) {
				return new RequestEventHandler(this);
			}
			else if(actions.browser) {
				return new BrowserEventHandler(this);
			}
			else if(actions.event) {
				return new DelegateEventHandler(this);
			}

			return new NullEventHandler(this);
		}
    }
}