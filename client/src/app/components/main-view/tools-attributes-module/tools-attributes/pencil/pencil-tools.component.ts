import { Component } from '@angular/core';
import {PencilGeneratorService} from '../../../../../services/tools/pencil-generator/pencil-generator.service';

@Component({
  selector: 'app-pencil-tools',
  templateUrl: './pencil-tools.component.html',
})
export class PencilToolsComponent {

  constructor(protected pencilGenerator: PencilGeneratorService) { }

}
