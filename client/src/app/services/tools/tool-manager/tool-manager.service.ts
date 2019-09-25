import { BrushGeneratorService } from './../brush-generator/brush-generator.service';
import { Injectable } from '@angular/core';
import { PencilGeneratorService } from '../pencil-generator/pencil-generator.service';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';
import {ToolSelectorService} from '../tool-selector/tool-selector.service';

@Injectable()
export class ToolManagerService {

private numberOfElements = 1;
primaryColor = 'transparent';
secondaryColor = 'black';

constructor(private rectangleGenerator: RectangleGeneratorService,
            private pencilGenerator: PencilGeneratorService,
            private brushGenerator: BrushGeneratorService,
            private toolSelector: ToolSelectorService) { }

  createElement(mouseEvent: any, canvas: any) {
    switch (this.toolSelector._activeTool) {
      case 'rectangle':
        this.rectangleGenerator.createRectangle(mouseEvent, canvas);
        break;
      case 'pencil':
        this.pencilGenerator.createPenPath(mouseEvent, canvas);
        break;
      case 'brush':
        this.brushGenerator.createBrushPath(mouseEvent, canvas);
        break;
    }
    this.numberOfElements += 1;
  }

  updateElement(mouseEvent: any, canvas: any) {
    switch (this.toolSelector._activeTool) {
      case 'rectangle':
        this.rectangleGenerator.updateRectangle(mouseEvent, canvas, this.numberOfElements);
        break;
      case 'pencil':
        this.pencilGenerator.updatePenPath(mouseEvent, canvas, this.numberOfElements);
        break;
      case 'brush':
          this.brushGenerator.updateBrushPath(mouseEvent, canvas, this.numberOfElements);
          break;
    }
  }

  finishElement(mouseEvent: any) {
    switch (this.toolSelector._activeTool) {
      case 'rectangle':
        this.rectangleGenerator.finishRectangle(mouseEvent);
        break;
      case 'pencil':
        this.pencilGenerator.finishPenPath(mouseEvent);
        break;
      case 'brush':
        this.brushGenerator.finishBrushPath(mouseEvent);
        break;
    }
  }
}
