import { Component } from '@angular/core';
import {PencilGeneratorService} from '../../../../../services/tools/pencil-generator/pencil-generator.service';

@Component({
  selector: 'app-pencil-tools',
  templateUrl: './pencil-tools.component.html',
  styleUrls: ['./../tool-attributes.component.scss'],
})
export class PencilToolsComponent {

  constructor(protected pencilGenerator: PencilGeneratorService) { }

}
