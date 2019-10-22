import { Injectable, Renderer2 } from '@angular/core';
import { PlotType } from '../../../data-structures/PlotType';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';

@Injectable()
export class PolygonGeneratorService {

  private readonly TEMP_RECT_ID = '#tempRect';

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
  private angleBetweenVertex: number;
  private currentPolygonID: string;
  private aspectRatio: number;
  private adjustment: number[];

  constructor(private rectangleGenerator: RectangleGeneratorService) {
    this.adjustment = [0, 0];
    this.aspectRatio = 0;
    this.nbOfApex = 3;
    this.angleBetweenVertex = (Math.PI * 2) / this.nbOfApex;
    this.strokeWidth = 1;
    this.plotType = PlotType.Contour;
    this.currentPolygonNumber = 0;
    this.mouseDown = false;
  }

  // Getters/Setters
  set _renderer(renderer: Renderer2) { this.renderer = renderer; }

  get _aspectRatio() { return this.aspectRatio; }

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
    this.setUpAttributes();

    // Setup of the children's HTML in canvas
    this.injectInitialHTML(mouseEvent, canvas, primaryColor, secondaryColor);
    this.currentPolygonID = '#polygon' + this.currentPolygonNumber;
    this.createTemporaryRectangle(mouseEvent, canvas, primaryColor, secondaryColor);
    this.mouseDown = true;
    return true;
  }

  updatePolygon(canvasPosX: number, canvasPosY: number, canvas: SVGElement, currentPolygonNumber: number) {
    if (this.mouseDown) {
      const currentPolygon = this.renderer.selectRootElement(this.currentPolygonID, true);
      this.rectangleGenerator.updateRectangle(canvasPosX, canvasPosY, canvas, currentPolygonNumber);
      const radius: number = this.determineRadius();
      const center: number[] = this.determineCenter(radius);
      const newPoints = this.determinePolygonVertex(center, radius);
      currentPolygon.setAttribute('points', newPoints);
    }
  }

  finishPolygon() {
    if (this.mouseDown) {
      // Remove the rectangle
      this.canvasElement.removeChild(this.renderer.selectRootElement(this.TEMP_RECT_ID, true));
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
        `<polygon id="polygon${this.currentPolygonNumber}"
        points="${points}"
        stroke="${primaryColor}" stroke-width="${this.strokeWidth}"
        fill="transparent"></polygon>`;
        break;
      case PlotType.Full:
        canvas.innerHTML +=
        `<polygon id="polygon${this.currentPolygonNumber}"
        points="${points}"
        stroke="transparent" stroke-width="${this.strokeWidth}"
        fill="${secondaryColor}"></polygon>`;
        break;
      case PlotType.FullWithContour:
        canvas.innerHTML +=
        `<polygon id="polygon${this.currentPolygonNumber}"
        points="${points}"
        stroke="${primaryColor}" stroke-width="${this.strokeWidth}"
        fill="${secondaryColor}"></polygon>`;
        break;
    }
  }

  createTemporaryRectangle(mouseEvent: MouseEvent, canvas: SVGElement, primaryColor: string, secondaryColor: string) {
    this.rectangleGenerator._plotType = PlotType.Contour;
    this.rectangleGenerator.createRectangle(mouseEvent, canvas, 'black', 'black');
    canvas.children[canvas.children.length - 1].id = 'tempRect';
    canvas.children[canvas.children.length - 1].setAttribute('stroke-dasharray', '4');
  }

  determineRadius(): number {
    const tempRect = this.renderer.selectRootElement(this.TEMP_RECT_ID, true);
    const h: number = parseFloat(tempRect.getAttribute('height') as string);
    const w: number = parseFloat(tempRect.getAttribute('width') as string);
    if ((w / h) <= this.aspectRatio) {
      if ((this.nbOfApex % 4) === 0) {
        return (w / 2) * this.adjustment[0];
      } else if ((this.nbOfApex % 2) === 0) {
        return w / 2;
      } else {
        return w * this.adjustment[1];
      }
    } else {
      if ((this.nbOfApex % 4) === 0) {
        return (h / 2) * this.adjustment[0];
      } else if ((this.nbOfApex % 2) === 0) {
        return (h / 2) * this.adjustment[0];
      } else {
        return h * this.adjustment[0];
      }
    }
  }

  determineCenter(radius: number): number[] {
    const tempRect = this.renderer.selectRootElement(this.TEMP_RECT_ID, true);
    const h: number = parseFloat(tempRect.getAttribute('height') as string);
    const w: number = parseFloat(tempRect.getAttribute('width') as string);
    const x: number = parseFloat(tempRect.getAttribute('x') as string);
    const y: number = parseFloat(tempRect.getAttribute('y') as string);
    const center: number[] = [(x + w / 2), (y + h / 2)];
    if (this.nbOfApex % 2 === 1) {
      if ((w / h) > this.aspectRatio ) {
        center[1] = y + radius;
      } else {
        // center[1] = y + h / 2 + radius / 2 * this.adjustment[0];
        center[1] = y + h * this.adjustment[0];
      }
    }
    return center;
  }

  determinePolygonVertex(center: number[], radius: number): string {
    let pointsAttribute = '';
    // We convert degrees to radians
    const angleBetweenVertex = (2 * Math.PI / this.nbOfApex);
    let i = 0;
    // We determine what is the position of each vertex
    for (i ; i < this.nbOfApex ; i++) {
      const xPos = center[0] + (radius * Math.cos((angleBetweenVertex * i - ((Math.PI / 2) + angleBetweenVertex / 2))));
      // Since the Y axis is inverted on canvas, we substract the radius
      const yPos = center[1] - (radius * Math.sin((angleBetweenVertex * i - ((Math.PI / 2) + angleBetweenVertex / 2))));
      pointsAttribute += ' ' + xPos + ',' + yPos;
    }
    // Remove the initial space
    pointsAttribute = pointsAttribute.substr(1);
    return pointsAttribute;
  }

  setUpAttributes() {
    this.angleBetweenVertex = (2 * Math.PI / this.nbOfApex);
    if (this.nbOfApex % 4 === 0) {
      const cosMax = Math.cos(this.angleBetweenVertex / 2);
      this.adjustment[0] = 1 / cosMax;
      this.aspectRatio = 1;
      // if r = 1...
    } else if (this.nbOfApex % 2 === 0) {
      const sinMax = Math.sin((Math.PI / 2) + this.angleBetweenVertex / 2);
      const xAspect = 2;
      const yAspect = 2 * sinMax;
      this.adjustment[0] = 1 / sinMax;
      this.aspectRatio = xAspect / yAspect;
    } else {
      // If r = 1...
      let i = Math.round((this.nbOfApex - 1) / 3);
      // exception for 9 sides
      if (this.nbOfApex === 9) {
        i -= 1;
      }
      const cosMax = Math.cos((Math.PI / 2) + (i * this.angleBetweenVertex));
      const xAspect = Math.abs(cosMax) * 2;
      const sinFlat = Math.sin((Math.PI / 2) + this.angleBetweenVertex / 2);
      const yAspect = 1 + sinFlat;
      this.aspectRatio = xAspect / yAspect;
      this.adjustment[0] = 1 / yAspect;
      this.adjustment[1] = 1 / xAspect;
      // si plus grand que ratio => x est trop grand
      // const r = 1 / yAspect;
      // const r = this.adjustment;
    }
  }
}
