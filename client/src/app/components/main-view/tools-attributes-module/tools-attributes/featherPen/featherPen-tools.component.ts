import { Component} from '@angular/core';
import { FeatherPenGeneratorService } from 'src/app/services/tools/featherPen-generator/featherPen-generator.service';

@Component({
  selector: 'app-featherPen-tools',
  templateUrl: './featherPen-tools.component.html',
})
export class FeatherPenToolsComponent {

  constructor(protected featherPenGenerator: FeatherPenGeneratorService) { }

}