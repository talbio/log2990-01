import { Component } from '@angular/core';
import { LineDashStyle, LineJoinStyle } from '../../../../../data-structures/line-styles';
import {LineGeneratorService} from '../../../../../services/tools/line-generator/line-generator.service';

@Component({
  selector: 'app-line-tools',
  templateUrl: './line-tools.component.html',
  styleUrls: ['./../tool-attributes.component.scss'],
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
