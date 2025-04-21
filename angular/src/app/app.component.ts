import {Component, ViewChild, inject} from '@angular/core'
import {
  AngularRenderOptions,
  BrowserUIAngular,
  jsPlumbService,
  SurfaceComponent
} from "@jsplumbtoolkit/browser-ui-angular"
import {
  AnchorLocations,
  BlankEndpoint,
  Edge,
  EVENT_TAP,
  PlainArrowOverlay,
  Surface,
  Base,
  EVENT_CANVAS_CLICK
} from "@jsplumbtoolkit/browser-ui"
import {ACTION_CHOICE, ACTION_INPUT, ACTION_MESSAGE, ACTION_TEST, END, SELECTABLE, START} from "./constants"
import {ChoiceComponent} from "./choice.component"
import {InputComponent} from "./input.component"
import {MessageComponent} from "./message.component"
import {EndComponent} from "./end.component"
import {StartComponent} from "./start.component"
import {TestComponent} from "./test.component"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild(SurfaceComponent) surfaceComponent!: SurfaceComponent

  toolkit!: BrowserUIAngular
  surface!: Surface

  $jsplumb = inject(jsPlumbService)

  nodeTypes = [
    {type:START, label:"Start"},
    {type:END, label:"End"},
    {type:ACTION_MESSAGE, label:"Message"},
    {type:ACTION_INPUT, label:"Input"},
    {type:ACTION_CHOICE, label:"Choice"},
    {type:ACTION_TEST, label:"Test"}
  ]

  toolkitParams = {
    portDataProperty:"choices"
  }

  renderParams:AngularRenderOptions = {
    zoomToFit:true,
    consumeRightClick:false,
    events:{
      [EVENT_CANVAS_CLICK]:(s:Surface) => s.toolkitInstance.clearSelection()
    }
  }

  view = {
    nodes:{
      [SELECTABLE]:{
        events:{
          [EVENT_TAP]:(p:{obj:Base, toolkit:BrowserUIAngular}) => {
            p.toolkit.setSelection(p.obj)
          }
        }
      },
      [START]:{
        parent:SELECTABLE,
        component:StartComponent
      },
      [END]:{
        parent:SELECTABLE,
        component:EndComponent
      },
      [ACTION_MESSAGE]:{
        parent:SELECTABLE,
        component:MessageComponent
      },
      [ACTION_INPUT]:{
        parent:SELECTABLE,
        component:InputComponent
      },
      [ACTION_CHOICE]:{
        parent:SELECTABLE,
        component:ChoiceComponent
      },
      [ACTION_TEST]:{
        parent:SELECTABLE,
        component:TestComponent
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
        useHTMLLabel:true,
        events:{
          [EVENT_TAP]:(p:{edge:Edge, toolkit:BrowserUIAngular}) => {
            p.toolkit.setSelection(p.edge)
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

  dataGenerator(el:Element) {
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
    }else if (type === ACTION_TEST) {
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

}
