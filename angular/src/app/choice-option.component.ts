import {BasePortComponent} from "@jsplumbtoolkit/browser-ui-angular"
import {Component, ElementRef} from "@angular/core"

@Component({
  selector:`choice-option`,
  template:`<div class="jtk-chatbot-choice-option"
                 data-jtk-source="true"
                 data-jtk-port-type="choice"
                 [attr.data-jtk-port]="obj['id']"
                 (click)="inspectChoice(obj['id'])">
    {{obj['label']}}
    <div class="jtk-choice-delete" (click)="removeChoice(obj['id'])"></div>
  </div>`
})
export class ChoiceOptionComponent extends BasePortComponent {

  constructor(el: ElementRef) {
    super(el);
  }

  inspectChoice(id:string) {
    this.parent.toolkit.setSelection(this.parent.getVertex().getPort(id))
  }

  removeChoice(id:string) {
    this.parent.toolkit.removePort(this.parent.getVertex(), id)
  }
}
