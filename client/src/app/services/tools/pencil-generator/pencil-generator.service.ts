import { Injectable } from '@angular/core';

@Injectable()
export class PencilGeneratorService {

  /**
   * attributes of pencil tool :
   */
  private strokeWidth: number = 1;
  private currentPencilPathNumber = 0;
  private OFFSET_CANVAS_X: number;
  private OFFSET_CANVAS_Y: number;
  private mouseDown = false;

  constructor() {}

  set _strokeWidth(width: number) {
    this.strokeWidth = width;
  }

  get _strokeWidth(): number {
    return this.strokeWidth;
  }
  // Initializes the path
  createPenPath(mouseEvent: MouseEvent, canvas: HTMLElement, primaryColor: string) {

    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

    canvas.innerHTML +=
      `<path id=\'pencilPath' ${this.currentPencilPathNumber} 
      \' d=\'M ${(mouseEvent.pageX - this.OFFSET_CANVAS_X)} 
       ${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)} 
      L ${(mouseEvent.pageX - this.OFFSET_CANVAS_X)} 
       ${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)} 
      \' stroke=\' ${primaryColor} \' stroke-width=\' ${this.strokeWidth} \' stroke-linecap=\'round\' fill=\'none\'></path>`;

    this.mouseDown = true;
  }

  /**
   * @desc // Updates the path when the mouse is moving (mousedown)
   */
  updatePenPath(mouseEvent: MouseEvent, canvas: HTMLElement, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentPath = canvas.children[currentChildPosition - 1];
      if (currentPath != null) {
        currentPath.setAttribute('d',
          currentPath.getAttribute('d') + ' L' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
        ' ' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y));
      }
    }
  }

  /**
   * @desc Finalizes the path, sets up the next one
   */
  finishPenPath() {
    this.currentPencilPathNumber += 1;
    this.mouseDown = false;
  }
}
