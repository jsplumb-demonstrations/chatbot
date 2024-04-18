/*
 * AngularJS Integration
 *
 * Originally shipped with JsPlumb Toolkit 2.x versions, this is a port from April 2024 to work with the current
 * latest version of JsPlumb (6.20.0). This integration piece functions with the current demo but is not yet fully tested.
 *
 * It is not recommended to make changes to this file. Or if you do, please share those changes with JsPlumb so we can
 * take them into account - we'll likely be shipping this with future versions of JsPlumb.
 *
 * Copyright 2024 JsPlumb
 * https://jsplumbtoolkit.com
 *
 * This software is not free. You need to be an evaluator or licensee of JsPlumb to use this.
 *
 */
;
(function () {

    const $SCOPE = "$scope"
    const $ATTRS = "$attrs"
    const $TIMEOUT = "$timeout"
    const $COMPILE = "$compile"
    const $JSPLUMB = "$jsPlumb"
    const $TEMPLATE_CACHE = "$templateCache"

    const JSPLUMB_SERVICE = "jsPlumbService"
    const JSPLUMB_FACTORY = "jsPlumbFactory"

    const EVENT_READY = "ready"
    const EVENT_REFRESH = "refresh"

    const ATTR_GROUP_CONTENT = "jtk-group-content"
    const CLASS_ANGULAR_DIRECTIVE = "jtk-angular-directive"

    const HANDLER_MINIVIEW = "miniview"
    const HANDLER_PALETTE = "palette"

    const DIRECTIVE_PALETTE = "jsplumbPalette"
    const DIRECTIVE_TOOLKIT = "jsplumbToolkit"
    const DIRECTIVE_MINIVIEW = "jsplumbMiniview"

    const NODE = "node"
    const GROUP = "group"

    const EQUALS = "="
    const AT = "@"
    const RESTRICT_E = "E"
    const RESTRICT_AE = "AE"

    const _noop = () => { };

    const _link = (fn) => {
        return function (scope, element, attrs, controller) {
            fn.apply(fn, arguments);
            const _resync = function () {

                // if this is a group, under certain circumstances the usual mechanism for making a node a child of the
                // group's dom element could have been undone by Angular not having finished painting the group at
                // the time that the node elements are added. the result is that the node elements end up getting
                // removed. so this code (in conjunction with a nodeAdded listener on the surface), takes care
                // of resetting everything to the way it should have been.
                if (scope.group) {
                    const target = element[0].querySelector(`[${ATTR_GROUP_CONTENT}]`) || element[0];
                    if (element[0]._jtkGroupProcessed !== true && element[0]._jtkGroupNodes) {

                        for (let i = 0; i < element[0]._jtkGroupNodes.length;i++) {
                            target.appendChild(element[0]._jtkGroupNodes[i].el);
                        }

                        delete element[0]._jtkGroupNodes;
                    }
                    target.setAttribute(ATTR_GROUP_CONTENT, "true");
                    element[0]._jtkGroupProcessed = true;
                }

                // post event to toolkit controller upstream
                scope.$emit(EVENT_REFRESH, scope.node || scope.group);
            };
            scope.$watch(null, _resync);  // for the first paint
            scope.$watchCollection(scope.node ? NODE : GROUP, _resync);  // for subsequent data changes.
        };
    };

    const _inherit = function(scope, prop) {
        let pn = scope.$parent, value = scope[prop];
        while(pn != null && value == null) {
            value = pn[prop];
            pn = pn.$parent;
        }
        if (value != null) {
            scope[prop] = value;
        }
    };

    angular.module($JSPLUMB, [])

        .factory(JSPLUMB_FACTORY, [$COMPILE, JSPLUMB_SERVICE, $TIMEOUT,  function ($compile, jsPlumbService, $timeout) {

            return {
                /**
                 * Create an instance of the jsPlumb Toolkit.
                 * @method instance
                 * @param params
                 *
                 */
                instance: function (params) {
                    params = params || {};
                    return {
                        restrict: RESTRICT_E,
                        template: params.template || `<div class='${CLASS_ANGULAR_DIRECTIVE}' style='height:100%;' ng-transclude></div>`,
                        transclude:true,
                        scope: {
                            renderParams: EQUALS,
                            params: EQUALS,
                            data: EQUALS,
                            format: EQUALS,
                            jtkId: AT,
                            surfaceId: AT,
                            init: EQUALS
                        },
                        replace: params.replace,
                        controller: [$SCOPE, $ATTRS, function ($scope, $attrs) {
                            this.jtk = jsPlumbService.getToolkit($attrs.toolkitId, $scope.params);
                            this.data = $scope.data;
                            $scope.toolkit = this.jtk;
                            const self = this;
                            $scope.$on(EVENT_REFRESH, function (e, node) {
                                self.jtk.updateNode(node);
                            });

                            params.controller && params.controller.apply(this, arguments);
                        }],
                        controllerAs: params.controllerAs,
                        link: function (scope, element, attrs, controller) {
                            const jtk = controller.jtk, args = arguments;
                            const p = jsPlumbToolkit.extend({}, scope.renderParams);
                            // must configure a miniview using the directive when using angular. otherwise
                            // there is a clash.
                            delete p.miniview;
                            let dataFormat = attrs.format;
                            let deferredEdgesPainted = 0;
                            jsPlumbToolkit.extend(p, {
                                id: attrs.surfaceId
                            });
                            // create an id for this renderer if one does not exist.
                            p.id = p.id || jsPlumbToolkit.uuid();

                            // in angular, disable enhanced views; it interferes with the two way data binding because
                            // it makes a copy of the original data.
                            p.enhancedView = false;

                            p.connectionHandler = function (edge, connectFn) {
                                deferredEdgesPainted++;
                                $timeout(connectFn);
                            };

                            // configure miniview if supplied as an attribute on the directive.
                            if (attrs.miniview != null) {
                                p.miniview = {
                                    container: attrs.miniview
                                };
                            }

                            const templateRenderer = {

                                asynchronous: true,
                                reactive: true,
                                update: function(el, data, v, renderer) { },
                                render: function(directiveId, data, toolkit, objectType, surface, def, modelObject, node, eventInfo) {
                                    const newScope = scope.$new();
                                    newScope[objectType] = data;
                                    newScope.toolkit = scope.toolkit;
                                    newScope.surface = scope.surface;
                                    const newNode = angular.element('<' + directiveId + ' ' + objectType + '="' + objectType + '" toolkit="toolkit" surface="surface"></' + directiveId + '>');
                                    $compile(newNode)(newScope);
                                    $timeout(() => surface.vertexRendered(modelObject, newNode[0], def, null))
                                },
                                cleanupVertex: function(objId, el) {
                                    el.parentNode && el.parentNode.removeChild(el);
                                },
                                cleanupPort:function(objId, el) { }
                            }

                            jsPlumbToolkit.ready(function () {
                                // write the Surface into the controller's scope
                                scope.surface = jtk.render(params.replace ? element[0] : element[0].childNodes[0], p, templateRenderer);
                                // register on the service
                                jsPlumbService.addSurface(p.id, scope.surface);

                                const vertexAdded = function(data) {
                                    if (data.vertex.group) {
                                        const groupEl = scope.surface.getRenderedGroup(data.vertex.group.id);
                                        if (groupEl) {
                                            if (groupEl._jtkGroupProcessed !== true) {
                                                groupEl._jtkGroupNodes  = groupEl._jtkGroupNodes || [];
                                                groupEl._jtkGroupNodes.push(data);
                                            }
                                        }
                                    }
                                }

                                scope.surface.bind(jsPlumbToolkit.EVENT_NODE_ADDED, vertexAdded);
                                scope.surface.bind(jsPlumbToolkit.EVENT_GROUP_ADDED, vertexAdded);

                                scope.toolkit.bind(jsPlumbToolkit.EVENT_PORT_ADDED, (p) => {
                                    $timeout(function() { scope.$apply(); });
                                });

                                scope.toolkit.bind(jsPlumbToolkit.EVENT_PORT_UPDATED, (p) => {
                                    $timeout(function() { scope.$apply(); });
                                });

                                scope.toolkit.bind(jsPlumbToolkit.EVENT_PORT_REMOVED, (p) => {
                                    $timeout(function() { scope.$apply(); });
                                });

                                // bind to nodeUpdated/groupUpdated events and apply the scope, to get changes
                                // through to the view layer.
                                scope.toolkit.bind(jsPlumbToolkit.EVENT_NODE_UPDATED, function() {
                                    $timeout(function() { scope.$apply(); });
                                });

                                scope.toolkit.bind(jsPlumbToolkit.EVENT_GROUP_UPDATED, function() {
                                    $timeout(function() { scope.$apply(); });
                                });

                                scope.toolkit.bind(jsPlumbToolkit.EVENT_DATA_LOAD_START, function() {
                                    deferredEdgesPainted = 0;
                                });

                                scope.toolkit.bind(jsPlumbToolkit.EVENT_DATA_LOAD_END, function() {
                                    if (deferredEdgesPainted > 0) {
                                        $timeout(scope.surface.jsplumb.getGroupManager().refreshAllGroups);
                                    }
                                    deferredEdgesPainted = 0;
                                });

                                // in angular 1.x the async node paint means we need to do this to be safe.
                                scope.surface.bind(jsPlumbToolkit.EVENT_EDGE_ADDED, function(data) {
                                    scope.surface.jsplumb.revalidate(data.connection.source);
                                });

                                // if user supplied a link function, call it.
                                params.link && params.link.apply(this, args);

                                if (scope.data) {
                                    jtk.load({ data: scope.data, type: dataFormat });
                                }

                                if (scope.init) {
                                    $timeout(function() {
                                        scope.init.apply(scope, args);
                                    });
                                }
                            });

                            params.link && params.link.apply(this, arguments);

                        }
                    };
                },
                node: function (params) {
                    const out = {};
                    jsPlumbToolkit.extend(out, params || {});
                    out.restrict = RESTRICT_E;
                    out.scope = out.scope || {};
                    out.scope.node = EQUALS;
                    out.scope.toolkit = EQUALS;
                    out.scope.surface = EQUALS;
                    out.link = _link(out.link || _noop);
                    if (params.inherit) {
                        if (out.controller == null) {
                            out.controller = [$SCOPE, function ($scope) {
                                for (let i = 0; i < params.inherit.length; i++) {
                                    _inherit($scope, params.inherit[i]);
                                }
                            }];
                        }
                        else if (out.controller.length != null) {
                            // an array. check if the array contains $scope.
                            let idx = out.controller.indexOf($SCOPE), scopeAdded = false;
                            if (idx === -1) {
                                out.controller.unshift($SCOPE);
                                idx = 0;
                                scopeAdded = true;
                            }

                            const fn = out.controller.pop();
                            out.controller.push(function() {
                                for (let i = 0; i < params.inherit.length; i++) {
                                    _inherit(arguments[idx], params.inherit[i]);
                                }
                                fn.apply(this, scopeAdded ? arguments.slice(1) : arguments);
                            });
                        }
                        else {
                            throw new TypeError("Controller spec must be in strict format to use inherit parameter with jsPlumb Angular integration");
                        }
                    }
                    return out;
                },

                group: function (params) {
                    const out = {};
                    jsPlumbToolkit.extend(out, params || {});
                    out.restrict = RESTRICT_E;
                    out.scope = out.scope || {};
                    out.scope.group = EQUALS;
                    out.scope.toolkit = EQUALS;
                    out.scope.surface = EQUALS;
                    out.link = _link(out.link || _noop);
                    if (params.inherit) {
                        if (out.controller == null) {
                            out.controller = [$SCOPE, function ($scope) {
                                for (let i = 0; i < params.inherit.length; i++) {
                                    _inherit($scope, params.inherit[i]);
                                }
                            }];
                        }
                        else if (out.controller.length != null) {
                            // an array. check if the array contains $scope.
                            let idx = out.controller.indexOf($SCOPE), scopeAdded = false;
                            if (idx === -1) {
                                out.controller.unshift($SCOPE);
                                idx = 0;
                                scopeAdded = true;
                            }

                            const fn = out.controller.pop();
                            out.controller.push(function() {
                                for (let i = 0; i < params.inherit.length; i++) {
                                    _inherit(arguments[idx], params.inherit[i]);
                                }
                                fn.apply(this, scopeAdded ? arguments.slice(1) : arguments);
                            });
                        }
                        else {
                            throw new TypeError("Controller spec must be in strict format to use inherit parameter with JsPlumb AngularJS integration");
                        }
                    }
                    return out;
                },


                /**
                 * Generate a Miniview directive.
                 * @method miniview
                 * @return {Object} A Miniview directive definition.
                 */
                miniview: function (params) {
                    return {
                        restrict: RESTRICT_AE,
                        scope: {
                            surfaceId: AT
                        },
                        replace: true,
                        template: "<div></div>",
                        link: function (scope, element, attrs) {
                            const _init = function () {
                                jsPlumbService.addMiniview(attrs.surfaceId, {
                                    container: element[0]
                                });
                            };
                            scope.$watch(null, _init);  // workaround angular async paint.
                        }
                    };
                }
            };
        }])

        .service(JSPLUMB_SERVICE, [ $TEMPLATE_CACHE, $TIMEOUT, function ($templateCache, $timeout) {

            const eg = new jsPlumbToolkit.EventGenerator(),
                _toolkits = {},
                _newToolkit = function (id, params) {
                    const tk = jsPlumbToolkit.newInstance(params || {});
                    tk._ngId = id;
                    _toolkits[id] = tk;
                    eg.fire(EVENT_READY, { id: id, toolkit: tk });
                    return tk;
                },
                _surfaces = {},
                _workQueues = {},
                _handlers = {
                    [HANDLER_PALETTE]: function (surface, params) {

                        new jsPlumbToolkit.SurfaceDropManager({
                            source:params.element,
                            selector:params.selector,
                            surface:surface,
                            dataGenerator: params.generator,
                            onCanvasDrop:params.onDrop
                        });

                    },
                    [HANDLER_MINIVIEW]: function (surface, params) {
                        const miniview = surface.addPlugin({
                            type:jsPlumbToolkit.MiniviewPlugin.type,
                            options: {
                                container: params.container
                            }
                        });

                        surface.toolkitInstance.bind(jsPlumbToolkit.EVENT_DATA_LOAD_END, function() {
                            $timeout(() => {
                                miniview.invalidate()
                            });
                        });

                        surface.toolkitInstance.bind(jsPlumbToolkit.EVENT_NODE_ADDED, function(params) {
                            $timeout(() => miniview.invalidate(params.node.id) )
                        });

                        surface.toolkitInstance.bind(jsPlumbToolkit.EVENT_GROUP_ADDED, function(params) {
                            $timeout(() => miniview.invalidate(params.group.id) )
                        });
                    }
                },
                _addToWorkQueue = function (surfaceId, params, handler) {
                    const s = _surfaces[surfaceId];
                    if (s) {
                        handler(s, params);
                    }
                    else {
                        _workQueues[surfaceId] = _workQueues[surfaceId] || [];
                        _workQueues[surfaceId].push([params, handler]);
                    }
                };

            /**
             * Binds to some event related to the toolkit with the given id, which may or may not yet exist, and in fact
             * for the case for which this functionality was added - a ready event - it most likely does not.
             * @method bind
             * @param {String} event ID of the event to bind to. Currently we support `ready` only.
             * @param {String} toolkitId ID of the Toolkit to bind the event to.
             * @param {Function} callback Function to call when the event fires. The function is passed (toolkit, toolkitId, eventId) as args.
             */
            this.bind = function (event, toolkitId, callback) {
                eg.bind(event, function (p) {
                    if (p.id === toolkitId)
                        callback(p.toolkit, toolkitId, event);
                });
            };

            /**
             * Gets an instance of the jsPlumb Toolkit by the ID used to create it.
             * @method getToolkit
             * @param {String} id ID used to create the Toolkit instance you want to retrieve.
             * @param {Object} [params] Optional parameters for the Toolkit instance's constructor.
             * @return {jsPlumbToolkit} An instance of the jsPlumb Toolkit; null if not found.
             */
            this.getToolkit = function (id, params) {
                id = id || jsPlumbToolkit.uuid();
                if (_toolkits[id] != null) {
                    return _toolkits[id];
                }
                else {
                    return _newToolkit(id, params);
                }
            };

            /**
             * Resets the toolkit with the given id - which is to say, deletes it, so that the next request
             * for it returns null and it gets recreated.
             * @method resetToolkit
             * @param {String} id ID of the toolkit to reset.
             */
            this.resetToolkit = function (id) {
                const tk = _toolkits[id];
                if (tk) {
                    tk.clear();
                    const rs = tk.getRenderers();
                    if (rs != null) {
                        for (let r in rs) {
                            delete _surfaces[rs[r]._ngId];
                        }
                    }

                    delete _toolkits[id];
                }
            };

            /**
             * Registers a Surface. If any extra components have been registered for this Surface they will be initialised now.
             * @method addSurface
             * @param {String} id ID to register the Surface with.
             * @param {Surface} surface Surface instance.
             */
            this.addSurface = function (id, surface) {
                _surfaces[id] = surface;
                surface._ngId = id;
                if (_workQueues[id]) {
                    for (let i = 0; i <_workQueues[id].length; i++) {
                        try {
                            _workQueues[id][i][1](surface, _workQueues[id][i][0]);
                        }
                        catch (e) {
                            if (typeof console != "undefined") {
                                console.log("Cannot create component " + e);
                            }
                        }
                    }
                }
                delete _workQueues[id];
            };

            /**
             * Retrieve a Surface by id. You will have set the id of the Surface via the `surface-id` attribute on the directive
             * element.
             * @method getSurface
             * @param {String} id ID of the Surface to retrieve.
             */
            this.getSurface = function (id) {
                return _surfaces[id];
            };

            /**
             * Add a component to the Surface with the given id. If the Surface already exists and has been initialised the component
             * will be added immediately; otherwise it will be enqueued for later processing.
             * @method addComponent
             * @param {String} surfaceId ID of the Surface to add the component to.
             * @param {Object} params Constructor parameters for the component.
             * @param {String} type Type of component to add.
             */
            this.addComponent = function (surfaceId, params, type) {
                _addToWorkQueue(surfaceId, params, _handlers[type]);
            };

            /**
             * Add a Palette to the Surface with the given id. If the Surface already exists and has been initialised the Palette
             * will be added immediately; otherwise it will be enqueued for later processing. This is really just a wrapper around
             * addComponent.
             * @method addPalette
             * @param {String} surfaceId ID of the Surface to add the Palette to.
             * @param {Object} params Constructor parameters for the Palette.
             */
            this.addPalette = function (surfaceId, params) {
                this.addComponent(surfaceId, params, HANDLER_PALETTE);
            };

            /**
             * Add a Miniview to the Surface with the given id. If the Surface already exists and has been initialised the Miniview
             * will be added immediately; otherwise it will be enqueued for later processing. This is just a wrapper around addComponent.
             * @method addMiniview
             * @param {String} surfaceId ID of the Surface to add the Miniview to.
             * @param {Object} params Constructor parameters for the Miniview.
             */
            this.addMiniview = function (surfaceId, params) {
                this.addComponent(surfaceId, params, HANDLER_MINIVIEW);
            };

        }])

        .directive(DIRECTIVE_MINIVIEW, [ JSPLUMB_FACTORY , function(jsPlumbFactory) {
            return jsPlumbFactory.miniview();
        }])

        /**
         * Provides an angular directive to create an instance of the Toolkit. Params discussed here are
         * provided as attributes to the element, for instance:
         *
         * <jsplumb-toolkit jtk-id="myToolkit" params="SomeController.myToolkitParams" .../>
         *
         * Note that of course since they are attributes then their real types are String, but the types discussed
         * here are the required types of objects resolved through Angular's DI.
         *
         * @class jsPlumbToolkit directive.
         * @param {String} [jtk-id] ID of the Toolkit to create. You will want to use this if you need to subsequently
         * access the Toolkit instance from the `jsPlumbService`.
         * @param {String} [surface-id] Optional ID of the Surface widget.
         * @param {Object} [params] Optional parameters for the Toolkit constructor.
         * @param {Object} [renderParams] Optional parameters for the Surface widget. It is highly likely you will
         * want to supply something here.
         * @param {Object} [data] Optional data to load at create time.
         * @param {Function} [init] Optional function to call back at the end of the Toolkit's `link` function.
         * This function is passed the current scope (which contains the Toolkit and Surface objects), as well as the
         * element into which the Toolkit was rendered, and the attributes that were set on the `jsplumb-toolkit` element.
         */
        .directive(DIRECTIVE_TOOLKIT, [ JSPLUMB_FACTORY, function(jsPlumbFactory) {
            return jsPlumbFactory.instance();
        }])

        /**
         * Provides an Angular directive for configuring a set of droppable nodes for a Surface.
         *
         * @class jsPlumb Palette directive
         * @param {Function} typeExtractor Function used to extract the type of a dropped node from the element that was dropped.
         * @param {Function} [dataGenerator] Optional function that can prepare some initial data for a dropped node.
         * @param {Object} [dragOptions] Options for the drag. If these are omitted then some sensible (at least, what
         * jsPlumb considers sensible) defaults are used.
         * @param {Function} [onDrop] Optional function to call after a Node or Group is dropped. The new Node or Group is passed
         * as a paremeter to the provided function.
         */
        .directive(DIRECTIVE_PALETTE, [ JSPLUMB_SERVICE, $TIMEOUT, function(jsPlumbService, $timeout) {
            return {
                restrict:RESTRICT_AE,
                scope:{
                    generator:EQUALS,
                    onDrop:EQUALS
                },
                link:function($scope, element, attrs) {
                    $timeout(function() {
                        const surface = jsPlumbService.getSurface(attrs.surfaceId);
                        if (surface) {

                            $scope.droppablesHandler = new jsPlumbToolkit.SurfaceDropManager({
                                source:element[0],
                                selector:attrs.selector,
                                surface:surface,
                                dataGenerator: $scope.generator,
                                onCanvasDrop:$scope.onDrop
                            });
                        }
                    });
                }
            }
        }]);

}).call(typeof window !== 'undefined' ? window : this);
