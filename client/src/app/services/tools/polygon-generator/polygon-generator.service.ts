import { Injectable, Renderer2 } from '@angular/core';
import { PlotType } from '../../../data-structures/PlotType';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';

@Injectable()
export class PolygonGeneratorService {

  private OFFSET_CANVAS_Y: number;
  private OFFSET_CANVAS_X: number;
  private currentPolygonNumber: number;
  private mouseDown: boolean;
  private canvasElement: SVGElement;
  private renderer: Renderer2;

  // attributes of polygon
  private strokeWidth: number;
  private plotType: PlotType;
  private nbOfApex: number;
  private tempRect: SVGElement;
  private currentPolygon: SVGElement;

  constructor(private rectangleGenerator: RectangleGeneratorService) {
    this.strokeWidth = 1;
    this.plotType = PlotType.Contour;
    this.currentPolygonNumber = 0;
    this.mouseDown = false;
    this.nbOfApex = 3;
  }

  // Getters/Setters
  set _renderer(renderer: Renderer2) { this.renderer = renderer; }

  get _strokeWidth() { return this.strokeWidth; }
  set _strokeWidth(width: number) { this.strokeWidth = width; }

  get _plotType() { return this.plotType; }
  set _plotType(plotType: PlotType) { this.plotType = plotType; }

  get _nbOfApex() { return this.nbOfApex; }
  set _nbOfApex(nb: number) { this.nbOfApex = nb; }

  // First layer functions
  createPolygon(mouseEvent: MouseEvent, canvas: SVGElement, primaryColor: string, secondaryColor: string) {

    // Setup of the service's parameters
    this.canvasElement = canvas;
    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

    // Setup of the children's HTML in canvas
    this.injectInitialHTML(mouseEvent, canvas, primaryColor, secondaryColor);
    const currentPolygonID = '#polygon' + this.currentPolygonNumber;
    console.log(currentPolygonID);
    this.currentPolygon = this.renderer.selectRootElement(currentPolygonID, true) as SVGElement;
    if (this.currentPolygon != null) {
      console.log('found the polygon');
    }
    this.createTemporaryRectangle(mouseEvent, canvas, primaryColor, secondaryColor);
    this.mouseDown = true;
    return true;
  }

  updatePolygon(canvasPosX: number, canvasPosY: number, canvas: SVGElement, currentPolygonNumber: number) {
    if (this.mouseDown) {
      this.rectangleGenerator.updateRectangle(canvasPosX, canvasPosY, canvas, currentPolygonNumber);
      const radius: number = this.determineRadius();
      // if radius doesn't make sense...
      if (radius === -1) { console.log('Failure to determine radius'); }
      const center: number[] = this.determineCenter();
      // For debugging purposes
      console.log(center[0] + ' in X and ' + center[1] + ' in Y');
      const newPoints = this.getNewPointsAttribute(center, radius);
      console.log('I generated new points');
      this.currentPolygon.setAttribute('points', newPoints);
    }
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
  injectInitialHTML(mouseEvent: MouseEvent, canvas: SVGElement, primaryColor: string, secondaryColor: string) {
    const point = '' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) + ',' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y);
    const points = point + ' ' + point + ' ' + point;
    switch (this.plotType) {
      case PlotType.Contour:
        canvas.innerHTML +=
        `<polygon id=polygon${this.currentPolygonNumber}
        points=${points}
        stroke=${primaryColor} stroke-width=${this.strokeWidth}
        fill=transparent></polygon>`;
        break;
      case PlotType.Full:
        canvas.innerHTML +=
        `<polygon id=polygon${this.currentPolygonNumber}
        points="${points}"
        stroke=transparent stroke-width=${this.strokeWidth}
        fill=${secondaryColor}></polygon>`;
        break;
      case PlotType.FullWithContour:
        canvas.innerHTML +=
        `<polygon id=polygon${this.currentPolygonNumber}
        points=${points}
        stroke=${primaryColor} stroke-width=${this.strokeWidth}
        fill=${secondaryColor}></polygon>`;
        break;
    }
    // console.log(`<polygon id=polygon${this.currentPolygonNumber}
    // points=${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}
    // ,${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)} ${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}
    // ,${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)} ${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}
    // ,${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}
    // stroke=${secondaryColor} stroke-width=${this.strokeWidth}
    // fill=transparent></polygon>`);
  }

  createTemporaryRectangle(mouseEvent: MouseEvent, canvas: SVGElement, primaryColor: string, secondaryColor: string) {
    // console.log('reached creatTemporaryRectangle()');
    this.rectangleGenerator.createRectangle(mouseEvent, canvas, secondaryColor, primaryColor);
    // console.log('created the rectangle');
    canvas.children[canvas.children.length - 1].id = 'tempRect';
    this.tempRect = this.renderer.selectRootElement('#tempRect', true) as SVGElement;
    if (this.tempRect != null) {
      console.log('found the rectangle');
    }
  }

  determineRadius(): number {
    if (this.tempRect != null) {
      if (parseFloat(this.tempRect.getAttribute('width') as string)
        < parseFloat(this.tempRect.getAttribute('height') as string)) {
        console.log('we kept width');
        return parseFloat(this.tempRect.getAttribute('width') as string) / 2;
      } else {
        console.log('we kept height');
        return parseFloat(this.tempRect.getAttribute('height') as string) / 2;
      }
    } else {
      return -1;
    }
  }

  determineCenter(): number[] {
    const h: number = parseFloat(this.tempRect.getAttribute('height') as string);
    const w: number = parseFloat(this.tempRect.getAttribute('width') as string);
    const x: number = parseFloat(this.tempRect.getAttribute('x') as string);
    const y: number = parseFloat(this.tempRect.getAttribute('y') as string);
    const center: number[] = [(x + w / 2), (y + h / 2)];
    console.log('rect X is ' + x + ' and rect Y is ' + y);
    return center;
  }

  getNewPointsAttribute(center: number[], radius: number): string {
    // We convert degrees to radians
    const angleBetweenVertex = (2 * Math.PI / this.nbOfApex);
    let pointsAttribute: string = center[0] + ',' + (center[1] - radius);
    console.log(pointsAttribute);
    let i = 1;
    // We determine what is the position of each vertex
    for (i ; i < this.nbOfApex ; i++) {
      const xPos = center[0] + (radius * (Math.cos((Math.PI) / 2 + angleBetweenVertex * i)));
      // Since the Y axis is inverted on canvas, we substract the radius
      const yPos = center[1] - (radius * (Math.sin((Math.PI) / 2 + angleBetweenVertex * i)));
      pointsAttribute += ' ' + xPos + ',' + yPos;
    }
    console.log(pointsAttribute);
    return pointsAttribute;
  }
}
