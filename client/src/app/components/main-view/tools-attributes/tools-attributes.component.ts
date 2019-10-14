import { Component } from '@angular/core';
import { ColorService } from 'src/app/services/tools/color/color.service';
import { EmojiGeneratorService } from 'src/app/services/tools/emoji-generator/emoji-generator.service';
import { PlotType } from '../../../data-structures/PlotType';
import { Tools } from '../../../data-structures/Tools';
import { BrushGeneratorService } from '../../../services/tools/brush-generator/brush-generator.service';
import { EllipseGeneratorService } from '../../../services/tools/ellipse-generator/ellipse-generator.service';
import { PencilGeneratorService } from '../../../services/tools/pencil-generator/pencil-generator.service';
import { RectangleGeneratorService } from '../../../services/tools/rectangle-generator/rectangle-generator.service';
import { LineGeneratorService } from './../../../services/tools/line-generator/line-generator.service';
import { ToolManagerService } from './../../../services/tools/tool-manager/tool-manager.service';

@Component({
  selector: 'app-tools-attributes',
  templateUrl: './tools-attributes.component.html',
  styleUrls: ['./tools-attributes.component.scss'],
})
export class ToolsAttributesComponent {

  constructor(protected toolManager: ToolManagerService,
              protected pencilGenerator: PencilGeneratorService,
              protected rectangleGenerator: RectangleGeneratorService,
              protected brushGenerator: BrushGeneratorService,
              protected lineGenerator: LineGeneratorService,
              protected ellipseGenerator: EllipseGeneratorService,
              protected colorService: ColorService,
              protected emojiGenerator: EmojiGeneratorService ) {
  }

  protected get PlotType() {
    return PlotType;
  }

  protected get Tools() {
    return Tools;
  }

}
