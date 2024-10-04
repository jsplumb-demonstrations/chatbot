<script>
  import {
    newInstance,
    AnchorLocations,
    PlainArrowOverlay,
    EVENT_TAP, EVENT_CANVAS_CLICK
  } from '@jsplumbtoolkit/browser-ui'

  import {inspectorTypeResolver, INSPECTORS} from './inspectors/index'

  import {
    SurfaceProvider,
    SurfaceComponent,
    MiniviewComponent,
    ControlsComponent,
    PaletteComponent,
    InspectorComponent
  } from "@jsplumbtoolkit/browser-ui-svelte"

  import { nodeTypes } from './constants'

  import StartComponent from './lib/start-component.svelte'
  import EndComponent from './lib/end-component.svelte'
  import MessageComponent from './lib/message-component.svelte'
  import ChoiceComponent from './lib/choice-component.svelte'
  import TestComponent from './lib/test-component.svelte'
  import InputComponent from './lib/input-component.svelte'

  import {START, END, ACTION_MESSAGE, ACTION_INPUT, ACTION_CHOICE, ACTION_TEST, SELECTABLE} from './constants'

  let surfaceComponent

  const modelOptions = {
    portDataProperty: "choices"
  }

  const renderParams = {
    zoomToFit: true,
    consumeRightClick: false,
    events:{
      [EVENT_CANVAS_CLICK]:(surface) => surface.toolkitInstance.clearSelection()
    }
  }

  const viewParams = {
    nodes: {
      [SELECTABLE]: {
        events: {
          [EVENT_TAP]: (p) => {
            p.toolkit.setSelection(p.obj)
          }
        }
      },
      [START]: {
        parent: SELECTABLE,
        component: StartComponent
      },
      [END]: {
        parent: SELECTABLE,
        component: EndComponent
      },
      [ACTION_MESSAGE]: {
        parent: SELECTABLE,
        component: MessageComponent
      },
      [ACTION_INPUT]: {
        parent: SELECTABLE,
        component: InputComponent
      },
      [ACTION_CHOICE]: {
        parent: SELECTABLE,
        component: ChoiceComponent
      },
      [ACTION_TEST]: {
        parent: SELECTABLE,
        component: TestComponent
      }
    },
    edges: {
      default: {
        overlays: [
          {
            type: PlainArrowOverlay.type,
            options: {
              location: 1,
              width: 10,
              length: 10
            }
          }
        ],
        label: "{{label}}",
        events: {
          [EVENT_TAP]: (p) => {
            p.toolkit.setSelection(p.edge)
          }
        }
      }
    },
    ports: {
      choice: {
        anchor: [AnchorLocations.Left, AnchorLocations.Right]
      }
    }
  }

  function dataGenerator(el) {
    const type = el.getAttribute("data-type")
    const base = {type}
    if (type === ACTION_MESSAGE) {
      Object.assign(base, {message: "Send a message"})
    } else if (type === ACTION_INPUT) {
      Object.assign(base, {message: "Grab some input", prompt: "please enter input"})
    } else if (type === ACTION_CHOICE) {
      Object.assign(base, {
        message: "Please choose:",
        choices: [
          {id: "1", label: "Choice 1"},
          {id: "2", label: "Choice 2"},
        ]
      })
    } else if (type === ACTION_TEST) {
      Object.assign(base, {
        message: "Apply test",
        choices: [
          {id: "1", label: "Result 1"},
          {id: "2", label: "Result 2"},
        ]
      })
    }

    return base
  }

</script>

<div class="jtk-demo-main" id="jtk-demo-chatbot">

  <!--
    Declare a SurfaceProvider as parent for everything else; this is how the palette and inspector
    locate the surface to attach to
  -->
  <SurfaceProvider>

      <!--
        The main canvas
      -->
      <SurfaceComponent viewOptions={viewParams}
                        renderOptions={renderParams}
                        modelOptions={modelOptions}
                        url="../dataset.json"
                        className="jtk-demo-canvas">

        <!-- attach a miniview -->
        <MiniviewComponent/>
        <!-- attach basic controls -->
        <ControlsComponent/>

      </SurfaceComponent>

    <div class="jtk-demo-rhs">

        <!-- the node palette -->
      <PaletteComponent dataGenerator={dataGenerator} selector=".jtk-chatbot-palette-item" className="sidebar node-palette">
        {#each nodeTypes as nodeType}
          <div class="jtk-chatbot-palette-item" data-type={nodeType.type}>
            {nodeType.label}
          </div>
        {/each}
      </PaletteComponent>

      <!-- node/edge inspector -->
      <InspectorComponent className="jtk-chatbot-inspector" inspectors={INSPECTORS} typeResolver={inspectorTypeResolver}/>

    </div>

  </SurfaceProvider>
</div>

