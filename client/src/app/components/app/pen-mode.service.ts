import { Injectable, Renderer2 } from '@angular/core';

@Injectable()
export class PenModeService {

  private currentPathNumber = 0;
  private canvas: any;
  private OFFSET_CANVAS_X: any;
  private OFFSET_CANVAS_Y: any;
  private mouseDown = false;

constructor(private renderer: Renderer2) { }

  // Initializes the path
  createPenPath(e: any) {
    this.canvas = this.renderer.selectRootElement('canvas');
    this.OFFSET_CANVAS_Y = this.canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = this.canvas.getBoundingClientRect().left;
    this.canvas.innerHTML += '<circle id=\'pathBegin' + this.currentPathNumber + '\' cx=\'' + (e.pageX - this.OFFSET_CANVAS_X) +
    '\' cy=\'' + (e.pageY - this.OFFSET_CANVAS_Y) + '\' r=\'3\'  fill=\'black\'></circle><path id=\'path' + this.currentPathNumber +
    '\' d=\'M' + (e.pageX - this.OFFSET_CANVAS_X) + ' ' + (e.pageY - this.OFFSET_CANVAS_Y) +
    '\' stroke=\'black\' stroke-width=\'6\' stroke-linecap=\'round\' fill=\'none\'></path>';
    // canvas.appendChild(rec)
    this.mouseDown = true;
  }

  // Updates the path when the mouse is moving (mousedown)
  updatePenPath(e: any) {
    if (this.mouseDown) {
      const currentPath = this.renderer.selectRootElement('path' + this.currentPathNumber);
      if (currentPath != null) {
        currentPath.setAttribute('d', currentPath.getAttribute('d') + ' L' + (e.pageX - this.OFFSET_CANVAS_X) +
        ' ' + (e.pageY - this.OFFSET_CANVAS_Y));
      }
    }
  }

  // Finalizes the path, sets up the next one
  finishPenPath(e: any) {
    this.currentPathNumber += 1;
    this.mouseDown = false;
  }
}
