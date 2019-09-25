import { Injectable } from '@angular/core';

@Injectable()
export class BrushGeneratorService {

  private currentBrushPathNumber = 0;
  private OFFSET_CANVAS_X: any;
  private OFFSET_CANVAS_Y: any;
  private mouseDown = false;
  private currentBrushPattern:string = 'url(#brushPattern1)';
  private strokeWidth: number = 5;

  constructor() { }
  set _strokeWidth(width: number) {
    this.strokeWidth = width;
  }

  get _strokeWidth(): number {
    return this.strokeWidth;
  }

  set _currentBrushPattern(pattern:string)
  {
    this.currentBrushPattern = pattern;
  }

  get _currentBrushPattern():string {
    return this.currentBrushPattern;
  }
//TODO: checker les childs, rajouter lepaisseur en paremetress
  // Initializes the path

  createBrushPath(mouseEvent: any, canvas: any) {

    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

    canvas.innerHTML +=
      '<path id=\'brushPath' + this.currentBrushPathNumber +
      '\' d=\'M' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
      ' ' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y) +
      ' L' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
      ' ' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y) +
      '\' stroke=\'' + this.currentBrushPattern + '\' stroke-width=\'' + this.strokeWidth + '\' stroke-linecap=\'round\' fill=\'none\'></path>';

    this.mouseDown = true;
  }
  // Updates the path when the mouse is moving (mousedown)
  updateBrushPath(mouseEvent: any, canvas: any, currentChildPosition: number) {
    if (this.mouseDown) {
      // const currentPath = document.getElementById("brushPath" + this.currentBrushPathNumber);
      const currentPath = canvas.children[currentChildPosition - 1];
      if (currentPath != null) {
        currentPath.setAttribute('d',
          currentPath.getAttribute('d') + ' L' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
        ' ' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y));
      }
    }
  }

  // Finalizes the path, sets up the next one
  finishBrushPath(e: any) {
    this.currentBrushPathNumber += 1;
    this.mouseDown = false;
  }
}
