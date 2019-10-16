import { Component} from '@angular/core';
import {BrushGeneratorService} from '../../../../../services/tools/brush-generator/brush-generator.service';

@Component({
  selector: 'app-brush-tools',
  templateUrl: './brush-tools.component.html',
  styleUrls: ['./brush-tools.component.scss'],
})
export class BrushToolsComponent {

  constructor(protected brushGenerator: BrushGeneratorService) { }

}
