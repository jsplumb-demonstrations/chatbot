
const app = angular.module('app', ['$jsPlumb']);

//
// Directives for node types
//
app.directive('start', function (jsPlumbFactory) {
    return jsPlumbFactory.node({
        templateUrl: "start_template.tpl",
        link:function(scope, element) {
        }
    });
});

app.directive('end', function (jsPlumbFactory) {
    return jsPlumbFactory.node({
        templateUrl: "end_template.tpl",
        link:function(scope, element) {
        }
    });
});

app.directive('message', function (jsPlumbFactory) {
    return jsPlumbFactory.node({
        templateUrl: "message_template.tpl",
        link:function(scope, element) {
        }
    });
});

app.directive('userinput', function (jsPlumbFactory) {
    return jsPlumbFactory.node({
        templateUrl: "userinput_template.tpl",
        link:function(scope, element) {
        }
    });
});

app.directive('choice', function (jsPlumbFactory) {
    return jsPlumbFactory.node({
        templateUrl: "choice_template.tpl",
        link:function(scope, element) {
        }
    });
});

app.directive('test', function (jsPlumbFactory) {
    return jsPlumbFactory.node({
        templateUrl: "test_template.tpl",
        link:function(scope, element) {
        }
    });
});


const START = "start"
const END = "end"
const ACTION_MESSAGE = "message"
const ACTION_INPUT = "userinput"
const ACTION_CHOICE = "choice"
const ACTION_TEST = "test"
const SELECTABLE = "selectable"
const PROPERTY_MESSAGE = "message"
const PROPERTY_PROMPT = "prompt"
const PROPERTY_LABEL = "label"
const CHOICE_PORT = "choice-port"
const EDGE = "edge"

app.controller("ChatbotController", function ($log, $scope, jsPlumbService) {

    let toolkit;
    let inspector;

    this.renderParams = {
        layout:{
            type:jsPlumbToolkit.AbsoluteLayout.type
        },
        view:{
            nodes:{
                [SELECTABLE]:{
                    events:{
                        [jsPlumbToolkit.EVENT_TAP]:(p) => {
                            toolkit.setSelection(p.obj)
                        }
                    }
                },
                [START]:{
                    parent:SELECTABLE,
                    templateId:`start`
                },
                [END]:{
                    parent:SELECTABLE,
                    templateId:`end`
                },
                [ACTION_MESSAGE]:{
                    parent:SELECTABLE,
                    templateId:`message`
                },
                [ACTION_INPUT]:{
                    parent:SELECTABLE,
                    templateId:`userinput`
                },
                [ACTION_CHOICE]:{
                    parent:SELECTABLE,
                    templateId:`choice`
                },
                [ACTION_TEST]:{
                    parent:SELECTABLE,
                    templateId:`test`
                }
            },
            edges:{
                default:{
                    overlays:[
                        {
                            type:jsPlumbToolkit.PlainArrowOverlay.type,
                            options:{
                                location:1,
                                width:10,
                                length:10
                            }
                        }
                    ],
                    label:"{{label}}",
                    events:{
                        [jsPlumbToolkit.EVENT_TAP]:(p) => {
                            toolkit.setSelection(p.edge)
                        }
                    }
                }
            },
            ports:{
                choice:{
                    anchor:[jsPlumbToolkit.AnchorLocations.Left, jsPlumbToolkit.AnchorLocations.Right ]
                }
            }
        },
        zoomToFit:true,
        consumeRightClick:false,
        defaults:{
            endpoint:jsPlumbToolkit.BlankEndpoint.type,
            anchor:jsPlumbToolkit.AnchorLocations.Continuous
        },
        modelEvents:[
            {
                event:jsPlumbToolkit.EVENT_TAP,
                selector:".jtk-choice-add",
                callback:(event, eventTarget, modelObject) => {
                    toolkit.setSelection(toolkit.addPort(modelObject.obj, { id:jsPlumbToolkit.uuid(), label:"Choice"}))
                }
            },
            {
                event:jsPlumbToolkit.EVENT_TAP,
                selector:".jtk-test-add",
                callback:(event, eventTarget, modelObject) => {
                    toolkit.setSelection(toolkit.addPort(modelObject.obj, { id:jsPlumbToolkit.uuid(), label:"Test"}))
                }
            },
            {
                event:jsPlumbToolkit.EVENT_TAP,
                selector:".jtk-choice-delete",
                callback:(event, eventTarget, modelObject) => {
                    toolkit.removePort(modelObject.obj)
                }
            },
            {
                event:jsPlumbToolkit.EVENT_TAP,
                selector:".jtk-chatbot-choice-option",
                callback:(event, eventTarget, modelObject) => {
                    toolkit.setSelection(modelObject.obj)
                }
            },
            {
                event:jsPlumbToolkit.EVENT_TAP,
                selector:'.jtk-delete',
                callback:(event, eventTarget, modelObject) => {
                    toolkit.removeNode(modelObject.obj)
                }
            }
        ]
    }

    this.toolkitParams = { portDataProperty:"choices" }

    this.dataGenerator = function(el) {
            const type = el.getAttribute("data-type")
            const base = { type }
            if (type === ACTION_MESSAGE) {
            Object.assign(base, { message:"Send a message"})
        } else if (type === ACTION_INPUT) {
            Object.assign(base, { message:"Grab some input", prompt:"please enter input"})
        } else if (type === ACTION_CHOICE) {
            Object.assign(base, {
                message:"Please choose:",
                choices:[
                    { id:"1", label:"Choice 1"},
                    { id:"2", label:"Choice 2"},
                ]
            })
        } else if (type === ACTION_TEST) {
            Object.assign(base, {
                message:"Apply test",
                choices:[
                    { id:"1", label:"Result 1"},
                    { id:"2", label:"Result 2"},
                ]
            })
        }

        return base
    }

    const inspectors = {
        [START]:`<div/>`,
        [END]:`<div/>`,
        [ACTION_MESSAGE]:`<div class="jtk-chatbot-inspector">
                            <span>Message:</span>
                            <input type="text" jtk-att="${PROPERTY_MESSAGE}" placeholder="message"/>
                            </div>`,
        [ACTION_INPUT]:`<div class="jtk-chatbot-inspector">
<span>Message:</span>
                            <input type="text" jtk-att="${PROPERTY_MESSAGE}" placeholder="message"/>
                            <span>Prompt:</span>
                            <input type="text" jtk-att="${PROPERTY_PROMPT}" placeholder="prompt"/>
                            </div>`,
        [ACTION_CHOICE]:`<div class="jtk-chatbot-inspector">
                        <span>Message:</span>
                            <input type="text" jtk-att="${PROPERTY_MESSAGE}" placeholder="message"/>
                            </div>`,
        [ACTION_TEST]:`<div class="jtk-chatbot-inspector">
                        <span>Message:</span>
                            <input type="text" jtk-att="${PROPERTY_MESSAGE}" placeholder="message"/>
                            </div>`,
        [CHOICE_PORT]:`<div class="jtk-chatbot-inspector">
                    <span>Label:</span>
                    <input type="text" jtk-att="${PROPERTY_LABEL}" jtk-focus placeholder="enter label..."/>
                    </div>`,
        [EDGE]:`<div class="jtk-chatbot-inspector">
                <div>Label</div>
                <input type="text" jtk-att="${PROPERTY_LABEL}"/>
</div>`
    }

    this.init = function(scope, element, attrs) {

        toolkit = scope.toolkit;

        window.s = scope.surface

        toolkit.load({
            url:`./dataset.json?foo=${jsPlumbToolkit.uuid()}`
        })

        inspector = new jsPlumbToolkit.VanillaInspector({
            templateResolver:(obj) => {
                if (jsPlumbToolkit.isNode(obj)) {
                    return inspectors[obj.type]
                } else if (jsPlumbToolkit.isEdge(obj)) {
                    return inspectors[EDGE]
                }
                else {
                    return inspectors[CHOICE_PORT]
                }
            },
            toolkit,
            container:document.querySelector(".inspector"),
            surface:scope.surface
        })
    };
})


