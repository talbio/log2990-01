import { Component, Input, ViewEncapsulation } from '@angular/core';

export interface ClipboardProperties {
  clipboardFunction: () => void;
  matToolTip: string;
  icon: string;
  isSvgIcon: boolean;
}
@Component({
  selector: 'app-abstract-clipboard',
  templateUrl: './abstract-clipboard.component.html',
  // Use the same style as tool buttons
  styleUrls: ['./abstract-clipboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AbstractClipboardComponent {

  @Input() clipboardProperties: ClipboardProperties;

}
