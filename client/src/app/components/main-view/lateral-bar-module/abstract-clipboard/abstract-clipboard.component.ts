import { Component, Input, ViewEncapsulation } from '@angular/core';
import { ObjectSelectorService } from 'src/app/services/tools/object-selector/object-selector.service';
import { ClipboardService } from './../../../../services/tools/clipboard/clipboard.service';

export interface ClipboardProperties {
  clipboardFunction: () => void;
  matToolTip: string;
  icon: string;
}
@Component({
  selector: 'app-abstract-clipboard',
  templateUrl: './abstract-clipboard.component.html',
  styleUrls: ['./abstract-clipboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AbstractClipboardComponent {

  @Input() clipboardProperties: ClipboardProperties;

  constructor(protected selection: ObjectSelectorService,
              protected clipboard: ClipboardService) {
    // Do nothing
  }

}
