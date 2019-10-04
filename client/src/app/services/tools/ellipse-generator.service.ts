import { Injectable } from '@angular/core';

@Injectable()
export class EllipseGeneratorService {

  private OFFSET_CANVAS_Y: number;
  private OFFSET_CANVAS_X: number;
  private currentEllipseNumber: number;
  private mouseDown: boolean;

  // attributes of rectangle
  private strokeWidth: number;
  private plotType: PlotType;

  constructor() {
    this.strokeWidth = 1;
    this.plotType = PlotType.Contour;
    this.currentEllipseNumber = 0;
    this.mouseDown = false;
  }

  get _strokeWidth() {
    return this.strokeWidth;
  }

  set _strokeWidth(width: number) {
    this.strokeWidth = width;
  }

  get _plotType() {
    return this.plotType;
  }

  set _plotType(plotType: PlotType) {
    this.plotType = plotType;
  }

  createRectangle(mouseEvent: MouseEvent, canvas: HTMLElement, primaryColor: string, secondaryColor: string) {

    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

    switch (this.plotType) {
      case PlotType.Contour:
        canvas.innerHTML +=
        `<ellipse id=\'ellipse${this.currentRectNumber}\'
        x=\'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
        data-start-x = \'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
        y=\'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
        data-start-y = \'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
        width = \'0\' height = \'0\' stroke=\'${secondaryColor}\' stroke-width=\'${this.strokeWidth}\'
        fill=\'transparent\'></ellipse>`;
        break;
      case PlotType.Full:
        canvas.innerHTML +=
        `<ellipse id=\'ellipse${this.currentRectNumber}\'
        cx=\'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
        data-start-rx = \'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
        cy=\'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
        data-start-ry = \'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
        stroke=\'transparent\' stroke-width= \'${this.strokeWidth}\'
        fill=\'${primaryColor}\'></ellipse>`;
        break;
      case PlotType.FullWithContour:
        canvas.innerHTML +=
        `<ellipse id=\'ellipse${this.currentRectNumber}\'
        cx=\'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
        data-start-rx = \'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
        cy=\'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
        data-start-ry = \'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
        stroke=\'${secondaryColor}\' stroke-width=\'${this.strokeWidth}\'
        fill=\'${primaryColor}\'></ellipse>`;
        break;
    }
    this.mouseDown = true;
  }

  updateSquare(mouseEvent: MouseEvent, canvas: HTMLElement, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentRect = canvas.children[currentChildPosition - 1];
      if (currentRect != null) {
        const startEllipseX: number = Number(currentRect.getAttribute('data-start-rx'));
        const startEllipseY: number = Number(currentRect.getAttribute('data-start-ry'));
        const actualWidth: number = (mouseEvent.pageX - this.OFFSET_CANVAS_X) - startEllipseX;
        const actualHeight: number = (mouseEvent.pageY - this.OFFSET_CANVAS_Y) - startEllipseY;
        if (actualWidth >= 0) {
          if (Math.abs(actualHeight) > Math.abs(actualWidth)) {
            // height is bigger
            currentRect.setAttribute('width', '' + Math.abs(actualHeight));
          } else {
            // width is bigger, act normal
            currentRect.setAttribute('width', '' + actualWidth);
          }
        } else {
          if (Math.abs(actualHeight) > Math.abs(actualWidth)) {
            // height is bigger
            currentRect.setAttribute('width', '' + Math.abs(actualHeight));
            currentRect.setAttribute('x', '' + (mouseEvent.pageX - this.OFFSET_CANVAS_X + Math.abs(actualWidth) - Math.abs(actualHeight)));
          } else {
            // width is bigger, act normal
            currentRect.setAttribute('width', '' + Math.abs(actualWidth));
            currentRect.setAttribute('x', '' + (mouseEvent.pageX - this.OFFSET_CANVAS_X));
          }
        }
        if (actualHeight >= 0) {
          if (Math.abs(actualWidth) > Math.abs(actualHeight)) {
            // width is bigger
            currentRect.setAttribute('height', '' + Math.abs(actualWidth));
          } else {
            // height is bigger, act normal
            currentRect.setAttribute('height', '' + actualHeight);
          }
        } else {
          if (Math.abs(actualWidth) > Math.abs(actualHeight)) {
            // width is bigger
            currentRect.setAttribute('height', '' + Math.abs(actualWidth));
            currentRect.setAttribute('y', '' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y + Math.abs(actualHeight) - Math.abs(actualWidth)));
          } else {
            // height is bigger, act normal
            currentRect.setAttribute('height', '' + Math.abs(actualHeight));
            currentRect.setAttribute('y', '' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y));
          }
        }
      }
    }
  }

  updateRectangle(mouseEvent: MouseEvent, canvas: HTMLElement, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentRect = canvas.children[currentChildPosition - 1];
      if (currentRect != null) {
        const startEllipseX: number = Number(currentRect.getAttribute('data-start-rx'));
        const startEllipseY: number = Number(currentRect.getAttribute('data-start-ry'));
        const actualWidth: number = (mouseEvent.pageX - this.OFFSET_CANVAS_X) - startEllipseX;
        const actualHeight: number = (mouseEvent.pageY - this.OFFSET_CANVAS_Y) - startEllipseY;
        if (actualWidth >= 0) {
          currentRect.setAttribute('width', '' + actualWidth);
        } else {
          currentRect.setAttribute('width', '' + Math.abs(actualWidth));
          currentRect.setAttribute('cx', '' + (mouseEvent.pageX - this.OFFSET_CANVAS_X));
        }
        if (actualHeight >= 0) {
          currentRect.setAttribute('height', '' + actualHeight);
        } else {
          currentRect.setAttribute('height', '' + Math.abs(actualHeight));
          currentRect.setAttribute('cy', '' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y));
        }
      }
    }
  }

  finishRectangle() {
    if (this.mouseDown) {
      this.currentEllipseNumber += 1;
      this.mouseDown = false;
    }
  }
}
