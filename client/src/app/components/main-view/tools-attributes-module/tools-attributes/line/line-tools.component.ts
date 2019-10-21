import { Component } from '@angular/core';
import {LineGeneratorService} from '../../../../../services/tools/line-generator/line-generator.service';
import { LineDashStyle, LineJoinStyle } from './../../../../../data-structures/LineStyles';

@Component({
  selector: 'app-line-tools',
  templateUrl: './line-tools.component.html',
})
export class LineToolsComponent {

  constructor(protected lineGenerator: LineGeneratorService) { }

  protected get LineDashStyle() {
    return LineDashStyle;
  }
  protected get LineJoinStyle() {
    return LineJoinStyle;
  }

}
