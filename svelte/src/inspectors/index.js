import {
    isNode, isEdge
} from "@jsplumbtoolkit/browser-ui"

import { ACTION_INPUT, ACTION_MESSAGE, ACTION_CHOICE, EDGE, CHOICE_PORT, ACTION_TEST } from "../constants";

import MessageInspector from "./MessageInspector.svelte"
import PortInspector from "./PortInspector.svelte"
import EdgeInspector from "./EdgeInspector.svelte"
import InputNodeInspector from "./InputNodeInspector.svelte"

export const INSPECTORS ={
    [ACTION_MESSAGE]:MessageInspector,
    [ACTION_INPUT]:InputNodeInspector,
    [ACTION_CHOICE]:MessageInspector,
    [ACTION_TEST]:MessageInspector,
    [CHOICE_PORT]:PortInspector,
    [EDGE]:EdgeInspector
}

export function inspectorTypeResolver(obj) {
    if (isNode(obj)) {
        return obj.type
    } else if (isEdge(obj)) {
        return EDGE
    }
    else {
        return CHOICE_PORT
    }
}


