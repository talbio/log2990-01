import { Component} from '@angular/core';
import {BrushGeneratorService} from '../../../../../services/tools/brush-generator/brush-generator.service';

@Component({
  selector: 'app-brush-tools',
  templateUrl: './brush-tools.component.html',
})
export class BrushToolsComponent {

  constructor(protected brushGenerator: BrushGeneratorService) { }

}
