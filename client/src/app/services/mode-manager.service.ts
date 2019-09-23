import { Injectable } from '@angular/core';
import { PenModeService } from './../components/app/pen-mode.service';
import { ShapeGeneratorService } from './../components/shapeGenerator.service';

@Injectable()
export class ModeManagerService {

constructor(private rectangle: ShapeGeneratorService, private pen: PenModeService) { }

  createElement(mode: string, e: any) {
    switch (mode) {
      case 'rectangle':
        this.rectangle.createRectangle(e);
        break;
      case 'pen':
        this.pen.createPenPath(e);
        break;
    }
  }

  updateElement(mode: string, e: any) {
    switch (mode) {
      case 'rectangle':
        this.rectangle.updateRectangle(e);
        break;
      case 'pen':
        this.pen.updatePenPath(e);
        break;
    }
  }

  finishElement(mode: string, e: any) {
    switch (mode) {
      case 'rectangle':
        this.rectangle.finishRectangle(e);
        break;
      case 'pen':
        this.pen.finishPenPath(e);
        break;
    }
  }
}
