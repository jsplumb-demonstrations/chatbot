import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

import './chatbot.css'

import {
    AnchorLocations,
    BlankEndpoint,
    EVENT_TAP,
    uuid,
    AbsoluteLayout,
    PlainArrowOverlay,
    newInstance
} from "@jsplumbtoolkit/browser-ui"

import {
    SurfaceComponent, SurfaceProvider,
    MiniviewComponent,
    ControlsComponent
} from "@jsplumbtoolkit/browser-ui-react";

import {
    CHOICES,
    START,
    END,
    ACTION_CHOICE,
    ACTION_INPUT,
    ACTION_MESSAGE,
    ACTION_TEST,
    SELECTABLE, nodeTypes
} from "./constants";

import StartComponent from './StartComponent'
import EndComponent from './EndComponent'
import MessageComponent from './MessageComponent'
import InputComponent from './InputComponent'
import ChoiceComponent from './ChoiceComponent'
import TestComponent from './TestComponent'
import Inspector from "./Inspector";
import Palette from './Palette'

const SURFACE_ID = "surface"

export default function ChatbotComponent({ctx}) {

    const surfaceComponent = useRef(null)
    const miniviewContainer = useRef(null)
    const controlsContainer = useRef(null)
    const inspectorContainer = useRef(null)
    const paletteContainer = useRef(null)

    const toolkit = newInstance({
        // the name of the property in each node's data that is the key for the data for the ports for that node.
        // for more complex setups you can use `portExtractor` and `portUpdater` functions - see the documentation for examples.
        portDataProperty:CHOICES

    })

    const renderParams= {
        zoomToFit:true,
        consumeRightClick:false,
        defaults:{
            endpoint:BlankEndpoint.type,
            anchor:AnchorLocations.Continuous
        },
        layout:{
            type:AbsoluteLayout.type
        }
    }

    const view = {
        nodes:{
            [SELECTABLE]:{
                events:{
                    [EVENT_TAP]:(p) => {
                        toolkit.setSelection(p.obj)
                    }
                }
            },
            [START]:{
                parent:SELECTABLE,
                jsx: (ctx) => <StartComponent ctx={ctx}/>
            },
            [END]:{
                parent:SELECTABLE,
                    jsx: (ctx) => <EndComponent ctx={ctx}/>
            },
            [ACTION_MESSAGE]:{
                parent:SELECTABLE,
                    jsx: (ctx) => <MessageComponent ctx={ctx}/>
            },
            [ACTION_INPUT]:{
                parent:SELECTABLE,
                    jsx: (ctx) => <InputComponent ctx={ctx}/>
            },
            [ACTION_CHOICE]:{
                parent:SELECTABLE,
                    jsx: (ctx) => <ChoiceComponent ctx={ctx}/>
            },
            [ACTION_TEST]:{
                parent:SELECTABLE,
                    jsx: (ctx) => <TestComponent ctx={ctx}/>
            }
        },
        edges:{
            default:{
                overlays:[
                    {
                        type:PlainArrowOverlay.type,
                        options:{
                            location:1,
                            width:10,
                            length:10
                        }
                    }
                ],
                label:"{{label}}",
                events:{
                    [EVENT_TAP]:(p) => {
                        toolkit.setSelection(p.edge)
                    }
                }
            }
        },
        ports:{
            choice:{
                anchor:[AnchorLocations.Left, AnchorLocations.Right ]
            }
        }
    }



    return <div style={{width:"100%",height:"100%",display:"flex"}}>
        <SurfaceProvider>
        <div className="jtk-demo-canvas">
            <SurfaceComponent renderOptions={renderParams} toolkit={toolkit} url="/public/dataset.json"
                    viewOptions={view} ref={ surfaceComponent }/>
            <ControlsComponent/>
            <MiniviewComponent/>
        </div>
        <div className="jtk-demo-rhs">
            <div className="sidebar node-palette">
                <Palette/>
                <Inspector/>
                <div className="description"></div>
            </div>
        </div>
        </SurfaceProvider>
    </div>
}
