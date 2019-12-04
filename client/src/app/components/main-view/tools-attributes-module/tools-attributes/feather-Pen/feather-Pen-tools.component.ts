import { Component} from '@angular/core';
import { FeatherPenGeneratorService } from '../../../../../services/tools/feather-pen-generator/feather-pen-generator.service';

@Component({
  selector: 'app-featherPen-tools',
  templateUrl: './feather-Pen-tools.component.html',
  styleUrls: ['./../tool-attributes.component.scss'],
})
export class FeatherPenToolsComponent {

  constructor(protected featherPenGenerator: FeatherPenGeneratorService) { }
}
