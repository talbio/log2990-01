import { Injectable } from '@angular/core';

@Injectable()
export class PencilGeneratorService {

  private currentPathNumber = 0;
  private OFFSET_CANVAS_X: any;
  private OFFSET_CANVAS_Y: any;
  private mouseDown = false;

constructor() { }
  //TODO: checker les childs, rajouter lepaisseur en paremetress
  // Initializes the path
  createPenPath(mouseEvent: any, canvas: any) {

    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

    canvas.innerHTML +=
      '<circle id=\'penPathBegin' + this.currentPathNumber +
      '\' cx=\'' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
      '\' cy=\'' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y) +
      '\' r=\'3\'  fill=\'black\'></circle>' +
      '<path id=\'path' + this.currentPathNumber +
      '\' d=\'M' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
      ' ' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y) +
      '\' stroke=\'black\' stroke-width=\'6\' stroke-linecap=\'round\' fill=\'none\'></path>';

    this.mouseDown = true;
  }
  // Updates the path when the mouse is moving (mousedown)
  updatePenPath(mouseEvent: any, canvas: any, currentChildPosition: number) {
    if (this.mouseDown) {
      // const currentPath = document.getElementById("path" + this.currentPathNumber);
      const currentPath = canvas.children[currentChildPosition - 1];
      if (currentPath != null) {
        currentPath.setAttribute('d',
          currentPath.getAttribute('d') + ' L' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
        ' ' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y));
      }
    }
  }

  // Finalizes the path, sets up the next one
  finishPenPath(e: any) {
    this.currentPathNumber += 1;
    this.mouseDown = false;
  }
}
