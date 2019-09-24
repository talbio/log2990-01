import { Injectable } from '@angular/core';
import { PenModeService } from './../components/app/pen-mode.service';
import { ShapeGeneratorService } from './../components/shapeGenerator.service';

@Injectable()
export class ModeManagerService {
public numberOfElements:number = 0;
constructor(private rectangle: ShapeGeneratorService, private pen: PenModeService) { }

  createElement(mode: string, e: any, canvas:any) {
    switch (mode) {
      case 'rectangle':
        this.rectangle.createRectangle(e, canvas);
        this.numberOfElements +=1;
        break;
      case 'pen':
        this.pen.createPenPath(e, canvas);
        this.numberOfElements +=2; //2 elements, since circle for path begin. Not a problem for update since only path is updated
        break;
    }
    
  }

  updateElement(mode: string, e: any, canvas:any) {
    switch (mode) {
      case 'rectangle':
        this.rectangle.updateRectangle(e, canvas, this.numberOfElements);
        break;
      case 'pen':
        this.pen.updatePenPath(e, canvas, this.numberOfElements);
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
