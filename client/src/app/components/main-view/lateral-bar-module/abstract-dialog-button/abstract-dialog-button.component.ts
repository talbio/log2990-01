import {Component, Input} from '@angular/core';

export interface DialogProperties {
  openDialog: () => void;
  matToolTip: string;
  icon: string;
}

@Component({
  selector: 'app-abstract-dialog-button',
  templateUrl: './abstract-dialog-button.component.html',
})
export class AbstractDialogButtonComponent {

  @Input() dialogProperties: DialogProperties;

}
