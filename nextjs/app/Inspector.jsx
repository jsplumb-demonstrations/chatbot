import React, {useState} from "react";

import { isNode, isPort} from "@jsplumbtoolkit/browser-ui"

import { InspectorComponent } from "@jsplumbtoolkit/browser-ui-react"

import {
ACTION_TEST, ACTION_MESSAGE, ACTION_CHOICE, ACTION_INPUT, START, END
} from "./constants";

const CHOICE_PORT="choicePort"
const EDGE = "edge"

export default function ChatbotInspector() {

    const [currentType, setCurrentType] = useState('')

    const renderEmptyContainer= () => setCurrentType('')
    const refresh = (obj) => {
        const ct = isNode(obj) ? obj.data.type : isPort(obj) ? CHOICE_PORT : EDGE
        setCurrentType(ct)
    }

    function baseActionTemplate() {
        return <div className="jtk-chatbot-inspector">
            <span>Message:</span>
        <input type="text" jtk-att="message" placeholder="message"/>
            </div>
    }

    return <InspectorComponent refresh={refresh} renderEmptyContainer={renderEmptyContainer}>

            { currentType === '' && <div/>}
            { currentType === START && <div/>}
            { currentType === END && <div/>}

            { currentType === ACTION_MESSAGE  &&  baseActionTemplate()}
            { currentType === ACTION_CHOICE &&  baseActionTemplate()}
            { currentType === ACTION_TEST &&  baseActionTemplate()}

            { currentType === ACTION_INPUT &&
            <div className="jtk-chatbot-inspector">
                <span>Message:</span>
                <input type="text" jtk-att="message" placeholder="message"/>
                <span>Prompt:</span>
                <input type="text" jtk-att="prompt" placeholder="prompt"/>
                </div>
            }

    { currentType === CHOICE_PORT &&
        <div className="jtk-chatbot-inspector">
            <span>Label:</span>
            <input type="text" jtk-att="label" jtk-focus placeholder="enter label..."/>
        </div>

    }

    { currentType === EDGE &&
    <div className="jtk-chatbot-inspector">
        <div>Label</div>
        <input type="text" jtk-att="value"/>
        </div>
    }


        </InspectorComponent>

}
