import { Injectable } from '@angular/core';

@Injectable()
export class LineGeneratorService {

  private readonly DEFAULT_WIDTH = 5;
  private strokeWidth: number;
  // private currentLineNumber: number;
  // private currentLineBlockNumber: number;
  private currentPolylineNumber: number;
  // private OFFSET_CANVAS_X: number;
  // private OFFSET_CANVAS_Y: number;
  private isMakingLine = false;
  // private currentLineBlockStartX: number;
  // private currentLineBlockStartY: number;
  private currentPolyineStartX: number;
  private currentPolyineStartY: number;

  constructor() {
    this.strokeWidth = this.DEFAULT_WIDTH;
    // this.currentLineNumber = 0;
    // this.currentLineBlockNumber = 0;
    this.currentPolylineNumber = 0;
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
  makeLine(canvasPosX: number, canvasPosY: number, canvas: HTMLElement, primaryColor: string, currentChildPosition: number) {
    if (!this.isMakingLine) {
      // Initiate the line
      // this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
      // this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;
      canvas.innerHTML +=
      `<polyline id="line${this.currentPolylineNumber}"
      stroke-width="${this.strokeWidth}"
      stroke-linecap="round"
      stroke="${primaryColor}"
      pointer-events="none"
      points="${canvasPosX},${canvasPosY}">
      </polyline>`;
// TODO check if 2nd point is necessary

        // `<g id=\'lineBlock${this.currentLineBlockNumber}\'
        // stroke-width=\'${this.strokeWidth}\'
        // stroke-linecap=\'round\'
        // stroke=\'${primaryColor}\'>
        //   <line id=\'line${this.currentLineNumber}OfBlock${this.currentLineBlockNumber}\'
        //   pointer-events="none"
        //   x1=\'${canvasPosX}\'
        //   y1=\'${canvasPosY}\'
        //   x2=\'${canvasPosX}\'
        //   y2=\'${canvasPosY}\'>
        //   </line>
        // </g>`;
      this.isMakingLine = true;
      // this.currentLineBlockStartX = canvasPosX;
      // this.currentLineBlockStartY = canvasPosY;
      this.currentPolyineStartX = canvasPosX;
      this.currentPolyineStartY = canvasPosY;

    } else {
      this.addPointToCurrentLine(canvasPosX, canvasPosY, canvas, currentChildPosition);
    }
  }

  addPointToCurrentLine(canvasPosX: number, canvasPosY: number, canvas: HTMLElement, currentChildPosition: number) {
    if (!this.isMakingLine) {
      return;
    }
    // const currentLineBlock = canvas.children[currentChildPosition - 1];
    const currentPolyLine = canvas.children[currentChildPosition - 1];
    // const previousLine = currentLineBlock.children[this.currentLineNumber];
    // const previousX = previousLine.getAttribute('x2');
    // const previousY = previousLine.getAttribute('y2');
    // this.currentLineNumber += 1;
    const newPoint = ` ${canvasPosX},${canvasPosY}`;
    currentPolyLine.setAttribute('points', currentPolyLine.getAttribute('points') + newPoint);
    // `<line id=\'line${this.currentLineNumber}OfBlock${this.currentLineBlockNumber}\'
    // pointer-events="none"
    // x1=\'${previousX}\'
    // y1=\'${previousY}\'
    // x2=\'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
    // y2=\'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'>
    // </line>`;
  }
  updateLine(canvasPosX: number, canvasPosY: number, canvas: HTMLElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      const currentPolyLine = canvas.children[currentChildPosition - 1];
      let pointsStr = currentPolyLine.getAttribute('points') as string;
      let indexLastPoint = pointsStr.lastIndexOf(' ');
      if (indexLastPoint === -1) {
        // There is only one point, add a second to enable the update
        this.addPointToCurrentLine(canvasPosX, canvasPosY, canvas, currentChildPosition);
        // There will be a splace since we added a point
        pointsStr = currentPolyLine.getAttribute('points') as string;
        indexLastPoint = pointsStr.lastIndexOf(' ');
      }
      const pointsWithoutLastStr = pointsStr.substring(0, indexLastPoint);
      const newPoints = `${pointsWithoutLastStr} ${canvasPosX},${canvasPosY}`;
      currentPolyLine.setAttribute('points', newPoints);
      // const currentLineBlock = canvas.children[currentChildPosition - 1];
      // const currentLine = currentLineBlock.children[this.currentLineNumber];
      // currentLine.setAttribute('x2', '' + canvasPosX);
      // currentLine.setAttribute('y2', '' + canvasPosY);
    }
  }
  finishLineBlock() {
    if (this.isMakingLine) {
      // this.currentLineBlockNumber += 1;
      // this.currentLineNumber = 0;
      this.currentPolylineNumber += 1;
      this.isMakingLine = false;
    }
  }
  finishAndLinkLineBlock(canvasPosX: number, canvasPosY: number, canvas: HTMLElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      const currentPolyLine = canvas.children[currentChildPosition - 1];
      const newPoint = `${this.currentPolyineStartX}, ${this.currentPolyineStartY}`;
      currentPolyLine.setAttribute('points', currentPolyLine.getAttribute('points') + newPoint);
      // currentLineBlock.innerHTML +=
      // `<line id=\'line${this.currentLineNumber}OfBlock${this.currentLineBlockNumber}\'
      // x1=\'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
      // y1=\'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
      // x2=\'${this.currentLineBlockStartX}\'
      // y2=\'${this.currentLineBlockStartY}\'>
      // </line>`;
      // this.currentLineBlockNumber += 1;
      // this.currentLineNumber = 0;
      this.currentPolylineNumber += 1;
      this.isMakingLine = false;
    }
  }
  deleteLineBlock(canvas: HTMLElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      const currentPolyLine = canvas.children[currentChildPosition - 1];
      currentPolyLine.remove();
      this.currentPolylineNumber -= 1;
      this.isMakingLine = false;
    }
    // const currentLineBlock = canvas.children[currentChildPosition - 1];
    // currentLineBlock.remove();
    // this.isMakingLine = false;
    // this.currentLineNumber = 0;
    // this.currentLineBlockNumber -= 1;
  }
  deleteLine(canvas: HTMLElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      const currentPolyLine = canvas.children[currentChildPosition - 1];
      const pointsStr = currentPolyLine.getAttribute('points') as string;
      const indexLastPoint = pointsStr.lastIndexOf(' ');
      if (indexLastPoint === -1) {
        // Only one point
        return;
      }
      const pointsWithoutLastStr = pointsStr.substring(1, indexLastPoint);
      currentPolyLine.setAttribute('points', pointsWithoutLastStr);
    }
    // if (this.currentLineNumber <= 0) {
    //   return;
    // }
    // const currentLineBlock = canvas.children[currentChildPosition - 1];
    // const previousLine = currentLineBlock.children[this.currentLineNumber];
    // previousLine.remove();
    // this.currentLineNumber -= 1;
  }
}
