import { Component, Input } from '@angular/core';

export interface ClipboardProperties {
  clipboardFunction: () => void;
  matToolTip: string;
  icon: string;
  isSvgIcon: boolean;
}
@Component({
  selector: 'app-abstract-clipboard',
  templateUrl: './abstract-clipboard.component.html',
})
export class AbstractClipboardComponent {

  @Input() clipboardProperties: ClipboardProperties;

  constructor() { }

}
