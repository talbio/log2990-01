import { Injectable } from '@angular/core';

@Injectable()
export class PencilGeneratorService {

  /**
   * attributes of pencil tool :
   */
  private readonly DEFAULT_WIDTH = 5;
  private strokeWidth: number;
  private currentPencilPathNumber: number;
  private OFFSET_CANVAS_X: number;
  private OFFSET_CANVAS_Y: number;
  private mouseDown = false;

  constructor() {
    this.strokeWidth = this.DEFAULT_WIDTH;
    this.currentPencilPathNumber = 0;
  }

  set _strokeWidth(width: number) {
    this.strokeWidth = width;
  }

  get _strokeWidth(): number {
    return this.strokeWidth;
  }
  // Uniquely useful for tests, comment for further usage
  set _mouseDown(state: boolean) {
    this.mouseDown = state;
  }

  // Initializes the path
  createPenPath(mouseEvent: MouseEvent, canvas: HTMLElement, primaryColor: string) {

    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;
    // let string addToHTML = generateHTML();

    canvas.innerHTML +=
      `<path id=\'pencilPath${this.currentPencilPathNumber}\'
      d=\'M ${(mouseEvent.pageX - this.OFFSET_CANVAS_X)} ${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}
      L ${(mouseEvent.pageX - this.OFFSET_CANVAS_X)} ${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
      stroke=\'${primaryColor}\' stroke-width=\'${this.strokeWidth}\' stroke-linecap=\'round\' fill=\'none\'></path>`;

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
    if (this.mouseDown) {
      this.currentPencilPathNumber += 1;
      this.mouseDown = false;
    }
  }

  // string GenerateHTML(mouseEvent: MouseEvent, canvas: HTMLElement) {
  //   return `<path id=\'pencilPath${this.currentPencilPathNumber}\'
  //   d=\'M ${(mouseEvent.pageX - this.OFFSET_CANVAS_X)} ${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}
  //   L ${(mouseEvent.pageX - this.OFFSET_CANVAS_X)} ${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
  //   stroke=\'${primaryColor}\' stroke-width=\'${this.strokeWidth}\' stroke-linecap=\'round\' fill=\'none\'></path>`;
  // }
}
