import {Component} from '@angular/core';
import {PlotType} from '../../../../../data-structures/plot-type';
import {EllipseGeneratorService} from '../../../../../services/tools/ellipse-generator/ellipse-generator.service';

@Component({
  selector: 'app-ellipse-tools',
  templateUrl: './ellipse-tools.component.html',
  styleUrls: ['./../tool-attributes.component.scss'],
})
export class EllipseToolsComponent {

  constructor(protected ellipseGenerator: EllipseGeneratorService) { }

  protected get PlotType() {
    return PlotType;
  }

}
