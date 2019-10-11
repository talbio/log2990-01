import { Injectable } from '@angular/core';

@Injectable()
export class LineGeneratorService {

  private readonly DEFAULT_WIDTH = 5;
  private strokeWidth: number;
  private currentLineNumber: number;
  private currentLineBlockNumber: number;
  private OFFSET_CANVAS_X: number;
  private OFFSET_CANVAS_Y: number;
  private isMakingLine = false;
  private currentLineBlockStartX: number;
  private currentLineBlockStartY: number;

  constructor() {
    this.strokeWidth = this.DEFAULT_WIDTH;
    this.currentLineNumber = 0;
    this.currentLineBlockNumber = 0;
  }

  set _strokeWidth(width: number) {
    this.strokeWidth = width;
  }

  get _strokeWidth(): number {
    return this.strokeWidth;
  }

  get _isMakingLine(): boolean {
    return this.isMakingLine;
  }

  // Initializes the path
  makeLine(mouseEvent: MouseEvent, canvas: HTMLElement, primaryColor: string, currentChildPosition: number) {
    if (!this.isMakingLine) {
      // Initiate the line
      this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
      this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

      canvas.innerHTML +=
        `<g id=\'lineBlock${this.currentLineBlockNumber}\'
        stroke-width=\'${this.strokeWidth}\'
        stroke-linecap=\'round\'
        stroke=\'${primaryColor}\'>
          <line id=\'line${this.currentLineNumber}OfBlock${this.currentLineBlockNumber}\'
          pointer-events="none"
          x1=\'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
          y1=\'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
          x2=\'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
          y2=\'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'>
          </line>
        </g>`;
      this.isMakingLine = true;
      this.currentLineBlockStartX = (mouseEvent.pageX - this.OFFSET_CANVAS_X);
      this.currentLineBlockStartY = (mouseEvent.pageY - this.OFFSET_CANVAS_Y);

    } else {
      this.addPointToCurrentLine(mouseEvent, canvas, currentChildPosition);
    }
  }

  addPointToCurrentLine(mouseEvent: MouseEvent, canvas: HTMLElement, currentChildPosition: number) {
    if (!this.isMakingLine) {
      return;
    }
    const currentLineBlock = canvas.children[currentChildPosition - 1];
    const previousLine = currentLineBlock.children[this.currentLineNumber];
    const previousX = previousLine.getAttribute('x2');
    const previousY = previousLine.getAttribute('y2');
    this.currentLineNumber += 1;
    currentLineBlock.innerHTML +=
    `<line id=\'line${this.currentLineNumber}OfBlock${this.currentLineBlockNumber}\'
    pointer-events="none"
    x1=\'${previousX}\'
    y1=\'${previousY}\'
    x2=\'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
    y2=\'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'>
    </line>`;
  }
  updateLine(canvasPosX: number, canvasPosY: number, canvas: HTMLElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      const currentLineBlock = canvas.children[currentChildPosition - 1];
      const currentLine = currentLineBlock.children[this.currentLineNumber];
      currentLine.setAttribute('x2', '' + canvasPosX);
      currentLine.setAttribute('y2', '' + canvasPosY);
    }
  }
  finishLineBlock() {
    if (this.isMakingLine) {
      this.currentLineBlockNumber += 1;
      this.currentLineNumber = 0;
      this.isMakingLine = false;
    }
  }
  finishAndLinkLineBlock(mouseEvent: MouseEvent, canvas: HTMLElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      const currentLineBlock = canvas.children[currentChildPosition - 1];
      currentLineBlock.innerHTML +=
      `<line id=\'line${this.currentLineNumber}OfBlock${this.currentLineBlockNumber}\'
      x1=\'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
      y1=\'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
      x2=\'${this.currentLineBlockStartX}\'
      y2=\'${this.currentLineBlockStartY}\'>
      </line>`;
      this.currentLineBlockNumber += 1;
      this.currentLineNumber = 0;
      this.isMakingLine = false;
    }
  }
  deleteLineBlock(canvas: HTMLElement, currentChildPosition: number) {
    const currentLineBlock = canvas.children[currentChildPosition - 1];
    currentLineBlock.remove();
    this.isMakingLine = false;
    this.currentLineNumber = 0;
    this.currentLineBlockNumber -= 1;
  }
  deleteLine(canvas: HTMLElement, currentChildPosition: number) {
    if (this.currentLineNumber <= 0) {
      return;
    }
    const currentLineBlock = canvas.children[currentChildPosition - 1];
    const previousLine = currentLineBlock.children[this.currentLineNumber];
    previousLine.remove();
    this.currentLineNumber -= 1;
  }
}
