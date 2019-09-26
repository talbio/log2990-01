import {Injectable} from '@angular/core';
import {BrushGeneratorService} from '../brush-generator/brush-generator.service';
import {PencilGeneratorService} from '../pencil-generator/pencil-generator.service';
import {RectangleGeneratorService} from '../rectangle-generator/rectangle-generator.service';
import {ToolSelectorService} from '../tool-selector/tool-selector.service';
import {Tools} from '../../../data-structures/Tools';

@Injectable()
export class ToolManagerService {

private numberOfElements = 1;
primaryColor = 'white';
secondaryColor = 'black';

constructor(private rectangleGenerator: RectangleGeneratorService,
            private pencilGenerator: PencilGeneratorService,
            private brushGenerator: BrushGeneratorService,
            private toolSelector: ToolSelectorService) { }

  createElement(mouseEvent: any, canvas: any) {
    switch (this.toolSelector._activeTool) {
      case Tools.Rectangle:
        this.rectangleGenerator.createRectangle(mouseEvent, canvas, this.primaryColor, this.secondaryColor);
        break;
      case Tools.Pencil:
        this.pencilGenerator.createPenPath(mouseEvent, canvas, this.secondaryColor);
        break;
      case Tools.Brush:
        this.brushGenerator.createBrushPath(mouseEvent, canvas);
        break;
    }
    this.numberOfElements += 1;
  }

  updateElement(mouseEvent: any, canvas: any) {
    switch (this.toolSelector._activeTool) {
      case Tools.Rectangle:
        this.rectangleGenerator.updateRectangle(mouseEvent, canvas, this.numberOfElements);
        break;
      case Tools.Pencil:
        this.pencilGenerator.updatePenPath(mouseEvent, canvas, this.numberOfElements);
        break;
      case Tools.Brush:
          this.brushGenerator.updateBrushPath(mouseEvent, canvas, this.numberOfElements);
          break;
    }
  }

  finishElement(mouseEvent: any) {
    switch (this.toolSelector._activeTool) {
      case Tools.Rectangle:
        this.rectangleGenerator.finishRectangle(mouseEvent);
        break;
      case Tools.Pencil:
        this.pencilGenerator.finishPenPath(mouseEvent);
        break;
      case Tools.Brush:
        this.brushGenerator.finishBrushPath(mouseEvent);
        break;
    }
  }
}
