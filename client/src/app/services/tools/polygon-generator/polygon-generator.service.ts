import { Injectable, Renderer2 } from '@angular/core';
import { PlotType } from '../../../data-structures/PlotType';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';

@Injectable()
export class PolygonGeneratorService {

  private OFFSET_CANVAS_Y: number;
  private OFFSET_CANVAS_X: number;
  private currentPolygonNumber: number;
  private mouseDown: boolean;
  private canvasElement: HTMLElement;
  private renderer: Renderer2;

  // attributes of polygon
  private strokeWidth: number;
  private plotType: PlotType;
  private nbOfApex: number;
  private tempRect: SVGElement;
  private currentPolygon: SVGElement;
  private rectangleGenerator: RectangleGeneratorService;

  constructor() {
    this.strokeWidth = 1;
    this.plotType = PlotType.Contour;
    this.currentPolygonNumber = 0;
    this.mouseDown = false;
    this.nbOfApex = 3;
  }

  // Getters/Setters
  set _rectangleGenerator(recGen: RectangleGeneratorService) { this.rectangleGenerator = recGen; }
  set _renderer(renderer: Renderer2) { this.renderer = renderer; }

  get _strokeWidth() { return this.strokeWidth; }
  set _strokeWidth(width: number) { this.strokeWidth = width; }

  get _plotType() { return this.plotType; }
  set _plotType(plotType: PlotType) { this.plotType = plotType; }

  get _nbOfApex() { return this.nbOfApex; }
  set _nbOfApex(nb: number) { this.nbOfApex = nb; }

  // First layer functions
  createPolygon(mouseEvent: MouseEvent, canvas: HTMLElement, primaryColor: string, secondaryColor: string) {

    // Setup of the service's parameters
    this.canvasElement = canvas;
    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

    // Setup of the children's HTML in canvas
    this.injectInitialHTML(mouseEvent, canvas, primaryColor, secondaryColor);
    const currentPolygonID = '#polygon' + this.currentPolygonNumber;
    this.currentPolygon = this.renderer.selectRootElement(currentPolygonID, true) as SVGElement;
    this.createTemporaryRectangle(mouseEvent, canvas, primaryColor, secondaryColor);
    this.mouseDown = true;
    return true;
  }

  updatePolygon(canvasPosX: number, canvasPosY: number, canvas: HTMLElement, currentPolygonNumber: number) {
    this.rectangleGenerator.updateRectangle(canvasPosX, canvasPosY, canvas, currentPolygonNumber);
    const radius: number = this.determineRadius();
    // if radius doesn't make sense...
    if (radius === -1) { console.log('Failure to determine radius'); }
    const center: number[] = this.determineCenter();
    // For debugging purposes
    console.log(center[0] + ' in X and ' + center[1] + ' in Y');
    this.currentPolygon.setAttribute('points', this.getNewPointsAttribute(center, radius));
  }

  finishPolygon() {
    if (this.mouseDown) {
      // Remove the rectangle
      this.canvasElement.removeChild(this.tempRect);
      this.currentPolygonNumber += 1;
      this.mouseDown = false;
    }
  }

  // Second layer functions
  injectInitialHTML(mouseEvent: MouseEvent, canvas: HTMLElement, primaryColor: string, secondaryColor: string) {
    switch (this.plotType) {
      case PlotType.Contour:
        canvas.innerHTML +=
        `<polygon id=polygon${this.currentPolygonNumber}
        points=${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}
        ,${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}
        tempRect=tempRectPolygon${this.currentPolygonNumber}
        stroke=${secondaryColor} stroke-width=${this.strokeWidth}
        fill=transparent></polygon>`;
        break;
      case PlotType.Full:
        canvas.innerHTML +=
        `<polygon id=polygon${this.currentPolygonNumber}
         points=${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}
        ,${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}
        tempRect=tempRectPolygon${this.currentPolygonNumber}
        stroke=transparent stroke-width=${this.strokeWidth}
        fill=${primaryColor}></polygon>`;
        break;
      case PlotType.FullWithContour:
        canvas.innerHTML +=
        `<polygon id=polygon${this.currentPolygonNumber}
        points=${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}
        ,${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}
        tempRect=tempRectPolygon${this.currentPolygonNumber}
        stroke=${secondaryColor} stroke-width=${this.strokeWidth}
        fill=${primaryColor}></polygon>`;
        break;
    }
  }

  createTemporaryRectangle(mouseEvent: MouseEvent, canvas: HTMLElement, primaryColor: string, secondaryColor: string) {
    this.rectangleGenerator.createRectangle(mouseEvent, canvas, primaryColor, secondaryColor);
    canvas.children[canvas.children.length - 1].setAttribute('stroke-type', 'dotted');
    const tempRectID = 'tempRectPolygon' + this.currentPolygonNumber;
    canvas.children[canvas.children.length - 1].setAttribute('id', tempRectID);
    this.tempRect = this.renderer.selectRootElement(tempRectID, true) as SVGElement;
  }

  determineRadius(): number {
    if (this.tempRect != null) {
      if ((this.tempRect.getAttribute('width') as unknown as number)
        < (this.tempRect.getAttribute('height') as unknown as number)) {
        return (this.tempRect.getAttribute('width') as unknown as number) / 2;
      } else {
        return (this.tempRect.getAttribute('height') as unknown as number) / 2;
      }
    } else {
      return -1;
    }
  }

  determineCenter(): number[] {
    const h: number = this.tempRect.getAttribute('height') as unknown as number;
    const w: number = this.tempRect.getAttribute('width') as unknown as number;
    const x: number = this.tempRect.getAttribute('x') as unknown as number;
    const y: number = this.tempRect.getAttribute('y') as unknown as number;
    const center: number[] = [(x + w / 2), (y + h / 2)];
    return center;
  }

  getNewPointsAttribute(center: number[], radius: number): string {
    // We convert degrees to radians
    const angleBetweenVertex = (360 / this.nbOfApex) * Math.PI / 180;
    let pointsAttribute: string = center[0] + ',' + (center[1] - radius);
    let i = 1;
    // We determine what is the position of each vertex
    for (i ; i < this.nbOfApex ; i++) {
      const xPos = center[0] + (radius * (Math.cos((Math.PI) / 2 + angleBetweenVertex * i)));
      // Since the Y axis is inverted on canvas, we substract the radius
      const yPos = center[1] - (radius * (Math.sin((Math.PI) / 2 + angleBetweenVertex * i)));
      pointsAttribute += ' ' + xPos + ',' + yPos;
    }
    return pointsAttribute;
  }
}
