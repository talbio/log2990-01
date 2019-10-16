import { Injectable } from '@angular/core';

@Injectable()
export class LineGeneratorService {

  private readonly DEFAULT_WIDTH = 5;
  private strokeWidth: number;
  private currentPolylineNumber: number;
  private isMakingLine = false;
  private currentPolyineStartX: number;
  private currentPolyineStartY: number;

  constructor() {
    this.strokeWidth = this.DEFAULT_WIDTH;
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
      canvas.innerHTML +=
      `<polyline id="line${this.currentPolylineNumber}"
      stroke-width="${this.strokeWidth}"
      stroke-linecap="round"
      stroke="${primaryColor}"
      pointer-events="none"
      fill="none"
      stroke-linejoin="round"
      points="${canvasPosX},${canvasPosY}">
      </polyline>`;

      this.isMakingLine = true;
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
    const currentPolyLine = canvas.children[currentChildPosition - 1];
    const newPoint = ` ${canvasPosX},${canvasPosY}`;
    currentPolyLine.setAttribute('points', currentPolyLine.getAttribute('points') + newPoint);
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
    }
  }
  finishLineBlock(canvas: HTMLElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      // delete the two last lines for double click
      this.deleteLine(canvas, currentChildPosition);
      this.deleteLine(canvas, currentChildPosition);
      this.currentPolylineNumber += 1;
      this.isMakingLine = false;
    }
  }
  finishAndLinkLineBlock(canvas: HTMLElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      // delete the two last lines for double click
      this.deleteLine(canvas, currentChildPosition);
      this.deleteLine(canvas, currentChildPosition);
      const currentPolyLine = canvas.children[currentChildPosition - 1];
      const newPoint = ` ${this.currentPolyineStartX},${this.currentPolyineStartY}`;
      currentPolyLine.setAttribute('points', currentPolyLine.getAttribute('points') + newPoint);
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
  }
  deleteLine(canvas: HTMLElement, currentChildPosition: number) {
    if (this.isMakingLine) {
      const currentPolyLine = canvas.children[currentChildPosition - 1];
      const pointsStr = currentPolyLine.getAttribute('points') as string;
      const indexLastPoint = pointsStr.lastIndexOf(' ');
      if (indexLastPoint === -1) {
        // Only one point, user never moved after creating the line
        return;
      }
      const pointsWithoutLastStr = pointsStr.substring(0, indexLastPoint);
      currentPolyLine.setAttribute('points', pointsWithoutLastStr);
    }
  }
}
