import {Component} from '@angular/core';
import {ColorApplicatorService} from '../../../../../services/tools/color-applicator/color-applicator.service';

@Component({
  selector: 'app-color-applicator-tools',
  templateUrl: './color-applicator-tools.component.html',
})
export class ColorApplicatorToolsComponent {
  constructor(protected colorApplicator: ColorApplicatorService) { }
}
