import { Injectable } from '@angular/core';
import { PencilGeneratorService } from '../pencil-generator/pencil-generator.service';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';
import {ToolSelectorService} from '../tool-selector/tool-selector.service';

@Injectable()
export class ToolManagerService {

private numberOfElements = 0;

constructor(private rectangleGenerator: RectangleGeneratorService,
            private pencilGenerator: PencilGeneratorService,
            private toolSelector: ToolSelectorService) { }

  createElement(mouseEvent: any, canvas: any) {
    switch (this.toolSelector._activeTool) {
      case 'rectangle':
        this.rectangleGenerator.createRectangle(mouseEvent, canvas);
        this.numberOfElements += 1;
        break;
      case 'pen':
        this.pencilGenerator.createPenPath(mouseEvent, canvas);
        // 2 elements, since circle for path begin. Not a problem for update since only path is updated
        this.numberOfElements += 2;
        break;
    }
  }

  updateElement(mouseEvent: any, canvas: any) {
    switch (this.toolSelector._activeTool) {
      case 'rectangle':
        this.rectangleGenerator.updateRectangle(mouseEvent, canvas, this.numberOfElements);
        break;
      case 'pen':
        this.pencilGenerator.updatePenPath(mouseEvent, canvas, this.numberOfElements);
        break;
    }
  }

  finishElement(mouseEvent: any) {
    switch (this.toolSelector._activeTool) {
      case 'rectangle':
        this.rectangleGenerator.finishRectangle(mouseEvent);
        break;
      case 'pen':
        this.pencilGenerator.finishPenPath(mouseEvent);
        break;
    }
  }
}
