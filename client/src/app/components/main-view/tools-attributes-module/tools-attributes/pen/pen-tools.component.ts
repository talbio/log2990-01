import { Component } from '@angular/core';
import { PenGeneratorService } from 'src/app/services/tools/pen-generator/pen-generator.service';

@Component({
  selector: 'app-pen-tools',
  templateUrl: './pen-tools.component.html',
})
export class PenToolsComponent {

  constructor(protected penGenerator: PenGeneratorService) {}

}
