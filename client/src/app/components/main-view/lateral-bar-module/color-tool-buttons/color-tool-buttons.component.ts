import {Component} from '@angular/core';
import {ColorService} from 'src/app/services/tools/color/color.service';
import {Color, ModalManagerService} from '../../../../services/modal-manager/modal-manager.service';

@Component({
  selector: 'app-color-tool-buttons',
  templateUrl: './color-tool-buttons.component.html',
  styleUrls: ['./color-tool-buttons.component.scss'],
})
export class ColorToolButtonsComponent {

  constructor(protected colorService: ColorService,
              protected modalManager: ModalManagerService) {
  }

  protected get Color() {
    return Color;
  }
}
