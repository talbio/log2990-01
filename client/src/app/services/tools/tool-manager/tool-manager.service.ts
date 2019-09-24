import { Injectable } from '@angular/core';
import { PencilGeneratorService } from '../pencil-generator/pencil-generator.service';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';
import {ToolSelectorService} from '../tool-selector/tool-selector.service';

@Injectable()
export class ToolManagerService {

private numberOfElements = 0;

constructor(private rectangle: RectangleGeneratorService,
            private pen: PencilGeneratorService,
            private toolSelector: ToolSelectorService) { }

  createElement(mouseEvent: any, canvas: any) {
    switch (this.toolSelector.activeTool) {
      case 'rectangle':
        this.rectangle.createRectangle(mouseEvent, canvas);
        this.numberOfElements += 1;
        break;
      case 'pen':
        this.pen.createPenPath(mouseEvent, canvas);
        this.numberOfElements += 2; //2 elements, since circle for path begin. Not a problem for update since only path is updated
        break;
    }

  }

  updateElement(mouseEvent: any, canvas: any) {
    switch (this.toolSelector.activeTool) {
      case 'rectangle':
        this.rectangle.updateRectangle(mouseEvent, canvas, this.numberOfElements);
        break;
      case 'pen':
        this.pen.updatePenPath(mouseEvent, canvas, this.numberOfElements);
        break;
    }
  }

  finishElement(mouseEvent: any) {
    switch (this.toolSelector.activeTool) {
      case 'rectangle':
        this.rectangle.finishRectangle(mouseEvent);
        break;
      case 'pen':
        this.pen.finishPenPath(mouseEvent);
        break;
    }
  }
}
