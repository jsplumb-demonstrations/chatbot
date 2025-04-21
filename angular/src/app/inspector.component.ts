import {Component} from "@angular/core"
import {InspectorComponent} from "@jsplumbtoolkit/browser-ui-angular"
import {Base, isNode, isPort } from "@jsplumbtoolkit/browser-ui"

import {
  ACTION_CHOICE,
  ACTION_INPUT,
  ACTION_MESSAGE,
  ACTION_TEST,
  PROPERTY_MESSAGE,
  PROPERTY_LABEL, PROPERTY_PROMPT
} from "./constants"

@Component({
  template:`
    
    @if(currentType === ACTION_MESSAGE) {
      <div class="jtk-chatbot-inspector">
          <span>Message:</span>
          <input type="text" jtk-att="message" placeholder="message"/>
      </div>
    }
    
    @if(currentType === ACTION_INPUT) {
      <div class="jtk-chatbot-inspector">
          <span>Message:</span>
          <input type="text" jtk-att="${PROPERTY_MESSAGE}" placeholder="message"/>
          <span>Prompt:</span>
          <input type="text" jtk-att="${PROPERTY_PROMPT}" placeholder="prompt"/>
      </div>
    }  
    
    @if(currentType === ACTION_CHOICE) {
      <div class="jtk-chatbot-inspector">
          <span>Message:</span>
          <input type="text" jtk-att="${PROPERTY_MESSAGE}" placeholder="message"/>
      </div>
    }
    
    @if(currentType === ACTION_TEST) {
      <div class="jtk-chatbot-inspector">
          <span>Message:</span>
          <input type="text" jtk-att="${PROPERTY_MESSAGE}" placeholder="message"/>
      </div>
    }
    
    @if(currentType === CHOICE_PORT) {
      <div class="jtk-chatbot-inspector">
          <span>Label:</span>
          <input type="text" jtk-att="${PROPERTY_LABEL}" jtk-focus placeholder="enter label..."/>
      </div>
    }  
    
    @if(currentType === EDGE) {
      <div class="jtk-chatbot-inspector">
          <div>Label</div>
          <input type="text" jtk-att="${PROPERTY_LABEL}"/>
      </div>
    }  
  `,
  selector:"app-inspector"
})
export class ChatbotInspectorComponent extends InspectorComponent {

  ACTION_MESSAGE = ACTION_MESSAGE
  ACTION_INPUT = ACTION_INPUT
  ACTION_CHOICE = ACTION_CHOICE
  ACTION_TEST = ACTION_TEST

  CHOICE_PORT = "choice-port"
  EDGE = "edge"


  override refresh(obj: Base): void {
    this.currentType = isNode(obj) ? obj.type : isPort(obj) ? this.CHOICE_PORT : this.EDGE
  }
}
