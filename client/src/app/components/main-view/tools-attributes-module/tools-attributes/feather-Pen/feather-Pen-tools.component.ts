import { Component} from '@angular/core';
import { FeatherPenGeneratorService } from '../../../../../services/tools/feather-Pen-generator/feather-Pen-generator.service';

@Component({
  selector: 'app-featherPen-tools',
  templateUrl: './feather-Pen-tools.component.html',
})
export class FeatherPenToolsComponent {

  constructor(protected featherPenGenerator: FeatherPenGeneratorService) { }
}
