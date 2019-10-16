import {Component} from '@angular/core';
import {PlotType} from '../../../../../data-structures/PlotType';
import {EllipseGeneratorService} from '../../../../../services/tools/ellipse-generator/ellipse-generator.service';

@Component({
  selector: 'app-ellipse-tools',
  templateUrl: './ellipse-tools.component.html',
  styleUrls: ['./ellipse-tools.component.scss'],
})
export class EllipseToolsComponent {

  constructor(protected ellipseGenerator: EllipseGeneratorService) { }

  protected get PlotType() {
    return PlotType;
  }

}
