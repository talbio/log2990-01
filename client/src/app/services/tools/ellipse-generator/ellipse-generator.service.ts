import { Injectable } from '@angular/core';
import { PlotType } from '../../../data-structures/PlotType';

@Injectable()
export class EllipseGeneratorService {

  private OFFSET_CANVAS_Y: number;
  private OFFSET_CANVAS_X: number;
  private currentEllipseNumber: number;
  private mouseDown: boolean;

  // attributes of ellipse
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

  createEllipse(mouseEvent: MouseEvent, canvas: HTMLElement, primaryColor: string, secondaryColor: string) {

    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

    switch (this.plotType) {
      case PlotType.Contour:
        canvas.innerHTML +=
        `<ellipse id=\'ellipse${this.currentEllipseNumber}\'
        data-start-x = \'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
        data-start-y = \'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
        cx=\'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
        cy=\'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
        rx=\'0\' ry=\'0\'
        stroke=\'${secondaryColor}\' stroke-width=\'${this.strokeWidth}\'
        fill=\'transparent\'></ellipse>`;
        break;
      case PlotType.Full:
        canvas.innerHTML +=
        `<ellipse id=\'ellipse${this.currentEllipseNumber}\'
        data-start-x = \'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
        data-start-y = \'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
        cx=\'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
        cy=\'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
        rx=\'0\' ry=\'0\'
        stroke=\'transparent\' stroke-width= \'${this.strokeWidth}\'
        fill=\'${primaryColor}\'></ellipse>`;
        break;
      case PlotType.FullWithContour:
        canvas.innerHTML +=
        `<ellipse id=\'ellipse${this.currentEllipseNumber}\'
        data-start-x = \'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
        data-start-y = \'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
        cx=\'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
        cy=\'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
        rx=\'0\' ry=\'0\'
        stroke=\'${secondaryColor}\' stroke-width=\'${this.strokeWidth}\'
        fill=\'${primaryColor}\'></ellipse>`;
        break;
    }
    this.mouseDown = true;
    return true;
  }

  updateCircle(canvasPosX: number, canvasPosY: number, canvas: HTMLElement, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentEllipse = canvas.children[currentChildPosition - 1];
      if (currentEllipse != null) {
        const startEllipseX: number = Number(currentEllipse.getAttribute('data-start-x'));
        const startEllipseY: number = Number(currentEllipse.getAttribute('data-start-y'));
        const radiusWidth: number = (canvasPosX - startEllipseX) / 2;
        const radiusHeight: number = (canvasPosY - startEllipseY) / 2;
        if (radiusWidth >= 0) {
          if (Math.abs(radiusHeight) > Math.abs(radiusWidth)) {
            // height is bigger
            currentEllipse.setAttribute('rx', '' + Math.abs(radiusHeight));
            currentEllipse.setAttribute('cx', '' + (startEllipseX + Math.abs(radiusHeight)));
          } else {
            // width is bigger, act normal
            currentEllipse.setAttribute('rx', '' + radiusWidth);
            currentEllipse.setAttribute('cx', '' + (startEllipseX + radiusWidth));
          }
        } else {
          if (Math.abs(radiusHeight) > Math.abs(radiusWidth)) {
            // height is bigger
            currentEllipse.setAttribute('rx', '' + Math.abs(radiusHeight));
            currentEllipse.setAttribute('cx', '' + (startEllipseX - Math.abs(radiusHeight)));
          } else {
            // width is bigger, act normal
            currentEllipse.setAttribute('rx', '' + Math.abs(radiusWidth));
            currentEllipse.setAttribute('cx', '' + (startEllipseX + radiusWidth));
          }
        }
        if (radiusHeight >= 0) {
          if (Math.abs(radiusWidth) > Math.abs(radiusHeight)) {
            // width is bigger
            currentEllipse.setAttribute('ry', '' + Math.abs(radiusWidth));
            currentEllipse.setAttribute('cy', '' + (startEllipseY + Math.abs(radiusWidth)));
          } else {
            // height is bigger, act normal
            currentEllipse.setAttribute('ry', '' + radiusHeight);
            currentEllipse.setAttribute('cy', '' + (startEllipseY + radiusHeight));
          }
        } else {
          if (Math.abs(radiusWidth) > Math.abs(radiusHeight)) {
            // width is bigger
            currentEllipse.setAttribute('ry', '' + Math.abs(radiusWidth));
            currentEllipse.setAttribute('cy', '' + (startEllipseY - Math.abs(radiusWidth)));
          } else {
            // height is bigger, act normal
            currentEllipse.setAttribute('ry', '' + Math.abs(radiusHeight));
            currentEllipse.setAttribute('cy', '' + (startEllipseY + radiusHeight));
          }
        }
      }
    }
  }

  updateEllipse(canvasPosX: number, canvasPosY: number, canvas: HTMLElement, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentEllipse = canvas.children[currentChildPosition - 1];
      if (currentEllipse != null) {
        const startEllipseX: number = Number(currentEllipse.getAttribute('data-start-x'));
        const startEllipseY: number = Number(currentEllipse.getAttribute('data-start-y'));
        const radiusWidth: number = (canvasPosX - startEllipseX) / 2;
        const radiusHeight: number = (canvasPosY - startEllipseY) / 2;
        if (radiusWidth >= 0) {
          currentEllipse.setAttribute('rx', '' + radiusWidth);
          currentEllipse.setAttribute('cx', '' + (startEllipseX + radiusWidth));
        } else {
          currentEllipse.setAttribute('rx', '' + Math.abs(radiusWidth));
          currentEllipse.setAttribute('cx', '' + (startEllipseX + radiusWidth));
        }
        if (radiusHeight >= 0) {
          currentEllipse.setAttribute('ry', '' + radiusHeight);
          currentEllipse.setAttribute('cy', '' + (startEllipseY + radiusHeight));
        } else {
          currentEllipse.setAttribute('ry', '' + Math.abs(radiusHeight));
          currentEllipse.setAttribute('cy', '' + (startEllipseY + radiusHeight));
        }
      }
    }
  }

  finishEllipse() {
    if (this.mouseDown) {
      this.currentEllipseNumber += 1;
      this.mouseDown = false;
    }
  }
}
