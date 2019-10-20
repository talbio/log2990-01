import { Component } from '@angular/core';
import { PlotType } from '../../../../../data-structures/PlotType';
import { PolygonGeneratorService } from './../../../../../services/tools/polygon-generator/polygon-generator.service';

@Component({
  selector: 'app-polygon-tools',
  templateUrl: './polygon-tools.component.html',
  styleUrls: ['./polygon-tools.component.scss'],
})
export class PolygonToolsComponent {

  constructor(protected polygonGenerator: PolygonGeneratorService) { }

  protected get PlotType() {
    return PlotType;
  }

}
