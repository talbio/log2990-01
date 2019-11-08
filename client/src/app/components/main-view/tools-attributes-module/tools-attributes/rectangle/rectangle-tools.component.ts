import { Component } from '@angular/core';
import { PlotType } from '../../../../../data-structures/plot-type';
import { RectangleGeneratorService } from '../../../../../services/tools/rectangle-generator/rectangle-generator.service';

@Component({
  selector: 'app-rectangle-tools',
  templateUrl: './rectangle-tools.component.html',
})
export class RectangleToolsComponent  {

  constructor(protected rectangleGenerator: RectangleGeneratorService) {}

  protected get PlotType() {
    return PlotType;
  }

}
