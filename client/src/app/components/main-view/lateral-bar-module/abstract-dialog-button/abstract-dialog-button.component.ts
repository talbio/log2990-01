import {Component, Input} from '@angular/core';

export interface DialogProperties {
  openDialog: () => void;
  matToolTip: string;
  icon: string;
  isSvgIcon: boolean;
}

@Component({
  selector: 'app-abstract-dialog-button',
  templateUrl: './abstract-dialog-button.component.html',
  styleUrls: ['./abstract-dialog-button.component.scss'],
})
export class AbstractDialogButtonComponent {

  @Input() dialogProperties: DialogProperties;

  constructor() {}

}
