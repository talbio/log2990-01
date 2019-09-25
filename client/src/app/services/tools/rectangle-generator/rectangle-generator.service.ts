import { Injectable } from '@angular/core';

@Injectable()
export class RectangleGeneratorService {

  private OFFSET_CANVAS_Y: any;
  private OFFSET_CANVAS_X: any;
  private currentRectNumber = 0;
  private mouseDown = false;

  constructor() {}

  createRectangle(mouseEvent: any, canvas: any) {

    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

    canvas.innerHTML +=
      '<rect id=\'rect' + this.currentRectNumber +
      '\' x=\'' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
      '\' data-start-x = \'' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
      '\' y=\'' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y) +
      '\' data-start-y = \'' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y) +
      '\' width = \'0\' height = \'0\' stroke=\'black\' stroke-width=\'6\'' +
      ' fill=\'transparent\'></rect>';

    this.mouseDown = true;
  }

  updateRectangle(mouseEvent: any, canvas: any, currentChildPosition: number) {
    if (this.mouseDown) {
      // const currentRect = document.getElementById('rect' + this.currentRectNumber);
      const currentRect = canvas.children[currentChildPosition - 1];
      if (currentRect != null) {
        const startRectX: number = Number(currentRect.getAttribute('data-start-x'));
        const startRectY: number = Number(currentRect.getAttribute('data-start-y'));
        if ((mouseEvent.pageX - this.OFFSET_CANVAS_X) >= startRectX) {
          currentRect.setAttribute('width', '' + ((mouseEvent.pageX - this.OFFSET_CANVAS_X) - startRectX));
        } else {
          currentRect.setAttribute('width', '' + (startRectX - (mouseEvent.pageX - this.OFFSET_CANVAS_X)));
          currentRect.setAttribute('x', '' + (mouseEvent.pageX - this.OFFSET_CANVAS_X));
        }
        if ((mouseEvent.pageY - this.OFFSET_CANVAS_Y) >= startRectY) {
          currentRect.setAttribute('height', '' + ((mouseEvent.pageY - this.OFFSET_CANVAS_Y) - startRectY));
        } else {
          currentRect.setAttribute('height', '' + (startRectY - (mouseEvent.pageY - this.OFFSET_CANVAS_Y)));
          currentRect.setAttribute('y', '' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y));
        }
      }
    }
  }

  finishRectangle(mouseEvent: any) {
    this.currentRectNumber += 1;
    this.mouseDown = false;
  }
}
