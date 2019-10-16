import { Injectable } from '@angular/core';
import { PlotType } from '../../../data-structures/PlotType';

enum Axis {
  x,
  y,
}

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
    const xPos = mouseEvent.pageX - this.OFFSET_CANVAS_X;
    const yPos = mouseEvent.pageY - this.OFFSET_CANVAS_Y;
    canvas.innerHTML +=
      this.generateEllipseElement(this.currentEllipseNumber, xPos, yPos, primaryColor, secondaryColor);
    this.mouseDown = true;
    return true;
  }

  updateCircle(canvasPosX: number, canvasPosY: number, canvas: SVGElement, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentEllipse = canvas.children[currentChildPosition - 1];
      if (currentEllipse != null) {
        const startEllipseX: number = Number(currentEllipse.getAttribute('data-start-x'));
        const startEllipseY: number = Number(currentEllipse.getAttribute('data-start-y'));
        const radiusWidth: number = (canvasPosX - startEllipseX) / 2;
        const radiusHeight: number = (canvasPosY - startEllipseY) / 2;
        this.updateAxisAttributes(currentEllipse, radiusWidth, radiusHeight, startEllipseX);
        this.updateAxisAttributes(currentEllipse, radiusHeight, radiusWidth, startEllipseY);
      }
    }
  }

  updateEllipse(canvasPosX: number, canvasPosY: number, canvas: SVGElement, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentEllipse = canvas.children[currentChildPosition - 1];
      if (currentEllipse != null) {
        const startEllipseX: number = Number(currentEllipse.getAttribute('data-start-x'));
        const startEllipseY: number = Number(currentEllipse.getAttribute('data-start-y'));
        const radiusWidth: number = (canvasPosX - startEllipseX) / 2;
        const radiusHeight: number = (canvasPosY - startEllipseY) / 2;
        if (radiusWidth >= 0) {
          this.setAxisAttributes(currentEllipse, Axis.x, radiusWidth, startEllipseX + radiusWidth);
        } else {
          this.setAxisAttributes(currentEllipse, Axis.x, Math.abs(radiusWidth), startEllipseX + radiusWidth);
        }
        if (radiusHeight >= 0) {
          this.setAxisAttributes(currentEllipse, Axis.y, radiusHeight, startEllipseY + radiusHeight);
        } else {
          this.setAxisAttributes(currentEllipse, Axis.y, Math.abs(radiusHeight), startEllipseY + radiusHeight);
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

  private updateAxisAttributes(currentEllipse: Element, firstRadius: number, secondRadius: number, startAxisPosition: number): void {
    if (firstRadius >= 0) {
      if (Math.abs(secondRadius) > Math.abs(firstRadius)) {
        // width is bigger
        this.setAxisAttributes(currentEllipse, Axis.y, Math.abs(secondRadius), startAxisPosition + Math.abs(secondRadius));
      } else {
        // height is bigger, act normal
        this.setAxisAttributes(currentEllipse, Axis.y, firstRadius, startAxisPosition + firstRadius);
      }
    } else {
      if (Math.abs(secondRadius) > Math.abs(firstRadius)) {
        // width is bigger
        this.setAxisAttributes(currentEllipse, Axis.y, Math.abs(secondRadius), startAxisPosition - Math.abs(secondRadius));
      } else {
        // height is bigger, act normal
        this.setAxisAttributes(currentEllipse, Axis.y, Math.abs(firstRadius), startAxisPosition + firstRadius);
      }
    }
  }

  private setAxisAttributes(currentEllipse: Element, axis: Axis, radiusValue: number, positionValue: number): void {
    let positionAxis = '';
    let radiusAxis = '';

    switch (axis) {
      case Axis.x:
        radiusAxis = 'rx';
        positionAxis = 'cx';
        break;
      case Axis.y:
        radiusAxis = 'ry';
        positionAxis = 'cy';
        break;
    }
    currentEllipse.setAttribute(radiusAxis, radiusValue.toString());
    currentEllipse.setAttribute(positionAxis, positionValue.toString());
  }

  private generateEllipseElement(id: number, xPos: number, yPos: number, primaryColor: string, secondaryColor: string): string {
    let strokeProperty = '';
    let fillProperty = '';
    switch (this.plotType) {
      case PlotType.Contour:
        strokeProperty = secondaryColor;
        fillProperty = 'transparent';
        break;
      case PlotType.Full:
        strokeProperty = 'transparent';
        fillProperty = primaryColor;
        break;
      case PlotType.FullWithContour:
        strokeProperty = secondaryColor;
        fillProperty = primaryColor;
        break;
    }
    return `<ellipse
        id='ellipse${id.toString()}'
        data-start-x = '${xPos.toString()}' data-start-y = '${yPos.toString()}'
        cx='${xPos.toString()}' cy='${yPos.toString()}' rx='0' ry='0'
        stroke='${strokeProperty}' stroke-width='${this.strokeWidth}' fill='${fillProperty}'></ellipse>`;
  }
}
