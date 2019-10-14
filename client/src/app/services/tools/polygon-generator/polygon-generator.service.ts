import { Injectable } from '@angular/core';
import { PlotType } from '../../../data-structures/PlotType';

@Injectable()
export class PolygonGeneratorService {

  private OFFSET_CANVAS_Y: number;
  private OFFSET_CANVAS_X: number;
  private currentPolygonNumber: number;
  private mouseDown: boolean;

  // attributes of polygon
  private strokeWidth: number;
  private plotType: PlotType;
  private nbOfApex: number;
  private anchor: [number, number];

constructor() {
  this.strokeWidth = 1;
  this.plotType = PlotType.Contour;
  this.currentPolygonNumber = 0;
  this.mouseDown = false;
}

  getStrokeWidth() {
    return this.strokeWidth;
  }

  _plotType() {
    return this.plotType;
  }

  createPolygon(mouseEvent: MouseEvent, canvas: HTMLElement, primaryColor: string, secondaryColor: string) {

    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

    switch (this.plotType) {
      case PlotType.Contour:
        canvas.innerHTML +=
        `<polygon id=\'polygon${this.currentPolygonNumber}\'
        points=\'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
        ,\'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
        stroke=\'${secondaryColor}\' stroke-width=\'${this.strokeWidth}\'
        fill=\'transparent\'></polygon>`;
        break;
      case PlotType.Full:
        canvas.innerHTML +=
        `<polygon id=\'polygon${this.currentPolygonNumber}\'
        points=\'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
        ,\'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
        stroke=\'transparent\' stroke-width=\'${this.strokeWidth}\'
        fill=\'${primaryColor}\'></polygon>`;
        break;
      case PlotType.FullWithContour:
        canvas.innerHTML +=
        `<polygon id=\'polygon${this.currentPolygonNumber}\'
        points=\'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
        ,\'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
        stroke=\'${secondaryColor}\' stroke-width=\'${this.strokeWidth}\'
        fill=\'${primaryColor}\'></polygon>`;
        break;
    }
    this.mouseDown = true;
    return true;
  }

  updatePolygon(mouseEvent: MouseEvent, canvas: HTMLElement, currentPolygonNumber: number) {
    const currentPolygon = canvas.children[canvas.children.length - 1];
    const angleBetweenVertex = 360 / this.nbOfApex;
    let radius: number;
    if (Math.abs(mouseEvent.pageX - this.anchor[0]) < Math.abs(mouseEvent.pageY - this.anchor[1])) {
      radius = (mouseEvent.pageX - this.anchor[0]) / 2;
    } else {
      radius = (mouseEvent.pageY - this.anchor[1]) / 2;
    }
    const center = [mouseEvent.pageX - this.anchor[0], mouseEvent.pageY - this.anchor[1]];
    let i = 0;
    // We determine what is the position of each vertex
    for (i ; i < this.nbOfApex ; i++) {
      const xPos = center[0] + (radius * (Math.cos(90 + angleBetweenVertex * i)));
      const yPos = center[1] + (radius * (Math.sin(90 + angleBetweenVertex * i)));
      const addedHTML = ' ' + xPos + ',' + yPos;
      currentPolygon.setAttribute('points', currentPolygon.getAttribute('points') + addedHTML);
    }
  }
  finishPolygon() {
    if (this.mouseDown) {
      this.currentPolygonNumber += 1;
      this.mouseDown = false;
    }
  }
}
