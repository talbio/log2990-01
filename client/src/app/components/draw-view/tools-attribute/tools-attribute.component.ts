import { BrushGeneratorService } from './../../../services/tools/brush-generator/brush-generator.service';
import {Component, OnInit} from '@angular/core';
import {PencilGeneratorService} from '../../../services/tools/pencil-generator/pencil-generator.service';
import {PlotType} from '../../../services/tools/PlotType';
import {RectangleGeneratorService} from '../../../services/tools/rectangle-generator/rectangle-generator.service';
import {ToolSelectorService} from '../../../services/tools/tool-selector/tool-selector.service';

@Component({
  selector: 'app-tools-attribute',
  templateUrl: './tools-attribute.component.html',
  styleUrls: ['./tools-attribute.component.scss'],
})
export class ToolsAttributeComponent implements OnInit {

  constructor(protected toolSelector: ToolSelectorService,
              protected pencilGenerator: PencilGeneratorService,
              protected rectangleGenerator: RectangleGeneratorService,
              protected brushGenerator: BrushGeneratorService) {
  }

  ngOnInit() {
  }

  get plotType() {
    return PlotType;
  }
  
}
