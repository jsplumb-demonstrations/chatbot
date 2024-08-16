import React from 'react';

import {ACTION_CHOICE, ACTION_INPUT, ACTION_MESSAGE, ACTION_TEST, nodeTypes} from "./constants";

import { PaletteComponent } from "@jsplumbtoolkit/browser-ui-react";

export default function Palette() {

    function dataGenerator(el) {
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
                message:"Test",
                choices:[
                    { id:"1", label:"Result 1"},
                    { id:"2", label:"Result 2"},
                ]
            })
        }

        return base
    }

    return <PaletteComponent dataGenerator={dataGenerator} selector="[data-type]" className="sidebar node-palette">
        { nodeTypes.map(nt => <div key={nt.type} className="jtk-chatbot-palette-item" data-type={nt.type}>{nt.label}</div>) }
    </PaletteComponent>
}
