import { ColorApplicatorService } from './../color-applicator/color-applicator.service';
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
            private colorApplicator: ColorApplicatorService,
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
      default:
        return;
    }
    this.numberOfElements += 1;
  }

  updateElement(mouseEvent: any, canvas: any) {
    switch (this.toolSelector._activeTool) {
      case Tools.Rectangle:
        if (mouseEvent.shiftKey) {
          this.rectangleGenerator.updateSquare(mouseEvent, canvas, this.numberOfElements);
        } else {
          this.rectangleGenerator.updateRectangle(mouseEvent, canvas, this.numberOfElements);
        }
        break;
      case Tools.Pencil:
        this.pencilGenerator.updatePenPath(mouseEvent, canvas, this.numberOfElements);
        break;
      case Tools.Brush:
          this.brushGenerator.updateBrushPath(mouseEvent, canvas, this.numberOfElements);
          break;
      default:
          return;
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
      default:
        return;
    }
  }

  changeElementLeftClick(mouseEvent: any) {
    switch (this.toolSelector._activeTool) {
      case Tools.ColorApplicator:
        this.colorApplicator.changePrimaryColor(mouseEvent, this.primaryColor);
      default:
        return;
    }
  }

  changeElementRightClick(mouseEvent: any) {
    switch (this.toolSelector._activeTool) {
      case Tools.ColorApplicator:
        this.colorApplicator.changeSecondaryColor(mouseEvent, this.secondaryColor);
      default:
        return;
    }
  }
}
