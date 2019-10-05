import { Injectable } from '@angular/core';
import { Colors } from 'src/app/data-structures/Colors';

const DASHED_LINE_VALUE = 5;
const STROKE_COLOR = Colors.BLACK;

@Injectable()
export class ObjectSelectorService {

  private OFFSET_CANVAS_Y: number;
  private OFFSET_CANVAS_X: number;
  private currentRectNumber: number;
  private mouseDown: boolean;
  private currentRect: Element;

  constructor() {
    this.currentRectNumber = 0;
    this.mouseDown = false;
  }

  createSelectorRectangle(mouseEvent: MouseEvent, canvas: HTMLElement) {

    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

    canvas.innerHTML +=
      `<rect id=\'rect${this.currentRectNumber}\'
            x=\'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
            data-start-x = \'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
            y=\'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
            data-start-y = \'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
            width = \'0\' height = \'0\' stroke=\'${STROKE_COLOR}\' stroke-dasharray = \'${DASHED_LINE_VALUE}\'
            fill=\'transparent\'></rect>`;

    this.mouseDown = true;
  }

  updateSelectorRectangle(mouseEvent: MouseEvent, canvas: HTMLElement, currentChildPosition: number) {

    if (this.mouseDown) {
      this.currentRect = canvas.children[currentChildPosition - 1];
      if (this.currentRect != null) {
        const startRectX: number = Number(this.currentRect.getAttribute('data-start-x'));
        const startRectY: number = Number(this.currentRect.getAttribute('data-start-y'));
        const actualWidth: number = (mouseEvent.pageX - this.OFFSET_CANVAS_X) - startRectX;
        const actualHeight: number = (mouseEvent.pageY - this.OFFSET_CANVAS_Y) - startRectY;
        if (actualWidth >= 0) {
          this.currentRect.setAttribute('width', '' + actualWidth);
        } else {
          this.currentRect.setAttribute('width', '' + Math.abs(actualWidth));
          this.currentRect.setAttribute('x', '' + (mouseEvent.pageX - this.OFFSET_CANVAS_X));
        }
        if (actualHeight >= 0) {
          this.currentRect.setAttribute('height', '' + actualHeight);
        } else {
          this.currentRect.setAttribute('height', '' + Math.abs(actualHeight));
          this.currentRect.setAttribute('y', '' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y));
        }
        this.selectItems(canvas);
      }
    }
  }

  selectItems(canvas: HTMLElement): void {
    const drawings = canvas.querySelectorAll('path');
    drawings.forEach((drawing) => {
      if (this.intersect(drawing.getBoundingClientRect() as DOMRect)) {
        drawing.style.stroke = 'red';
      } else { drawing.style.stroke = 'black'; }
    });
  }

  intersect(a: DOMRect): boolean {
    const b = this.currentRect.getBoundingClientRect();
    return !((a.left > b.right ||
      b.left > a.right) ||
      (a.top > b.bottom ||
        b.top > a.bottom));
  }

  finishRectangle(): void {
    if (this.mouseDown) {
      this.currentRectNumber += 1;
      this.mouseDown = false;
    }
  }
}
