import { Injectable } from '@angular/core';

@Injectable()
export class BrushGeneratorService {

  private readonly DEFAULT_WIDTH = 5;
  private readonly DEFAULT_BRUSH_PATTERN = 'url(#brushPattern1)';

  private strokeWidth: number;
  private currentBrushPathNumber: number;
  private OFFSET_CANVAS_X: number;
  private OFFSET_CANVAS_Y: number;
  private mouseDown: boolean;
  private currentBrushPattern: string;

  constructor() {
    this.strokeWidth = this.DEFAULT_WIDTH;
    this.currentBrushPattern = this.DEFAULT_BRUSH_PATTERN;
    this.mouseDown = false;
    this.currentBrushPathNumber = 0;
  }

  set _strokeWidth(width: number) {
    this.strokeWidth = width;
  }

  get _strokeWidth(): number {
    return this.strokeWidth;
  }

  set _currentBrushPattern(pattern: string) {
    this.currentBrushPattern = pattern;
  }

  get _currentBrushPattern(): string {
    return this.currentBrushPattern;
  }

  createBrushPath(mouseEvent: MouseEvent, canvas: HTMLElement) {

    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

    canvas.innerHTML +=
      `<path id=\'brushPath ${this.currentBrushPathNumber}
      \' d=\'M ${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}
       ${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}
       L ${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}
       ${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}
      \' stroke=\' ${this.currentBrushPattern} \' stroke-width=\' ${this.strokeWidth}
      \' stroke-linecap=\'round\' fill=\'none\'></path>`;

    this.mouseDown = true;
  }

  // Updates the path when the mouse is moving (mousedown)
  updateBrushPath(mouseEvent: MouseEvent, canvas: HTMLElement, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentPath = canvas.children[currentChildPosition - 1];
      if (currentPath != null) {
        currentPath.setAttribute('d',
          currentPath.getAttribute('d') + ' L' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
        ' ' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y));
      }
    }
  }

  // Finalizes the path, sets up the next one
  finishBrushPath() {
    if (this.mouseDown) {
      this.currentBrushPathNumber += 1;
      this.mouseDown = false;
    }
  }
}
