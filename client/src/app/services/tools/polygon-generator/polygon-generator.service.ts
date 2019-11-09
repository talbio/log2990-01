import {Injectable} from '@angular/core';
import {AbstractClosedShape} from '../../../data-structures/abstract-closed-shape';
import { PlotType } from '../../../data-structures/plot-type';
import {MousePositionService} from '../../mouse-position/mouse-position.service';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';

@Injectable()
export class PolygonGeneratorService extends AbstractClosedShape {

  private readonly TEMP_RECT_ID = '#tempRect';

  private nbOfApex: number;
  private angleBetweenVertex: number;
  private currentPolygonID: string;
  private aspectRatio: number;
  private readonly adjustment: number[];

  constructor(protected undoRedoService: UndoRedoService,
              protected mousePositionService: MousePositionService,
              private rectangleGenerator: RectangleGeneratorService) {
    super(undoRedoService, mousePositionService);
    this.adjustment = [0, 0];
    this.aspectRatio = 0;
    this.nbOfApex = 3;
    this.angleBetweenVertex = (Math.PI * 2) / this.nbOfApex;
  }

  // Getters/Setters
  get _aspectRatio() { return this.aspectRatio; }

  get _strokeWidth() { return this.strokeWidth; }
  set _strokeWidth(width: number) { this.strokeWidth = width; }

  get _plotType() { return this.plotType; }
  set _plotType(plotType: PlotType) { this.plotType = plotType; }

  get _nbOfApex() { return this.nbOfApex; }
  set _nbOfApex(nb: number) { this.nbOfApex = nb; }

  // First layer functions
  createElement(xPosition: number, yPosition: number, primaryColor: string, secondaryColor: string) {
    // Setup of the service's parameters
    this.setUpAttributes();

    // Setup of the children's HTML in canvas
    this.injectInitialHTML(xPosition, yPosition, primaryColor, secondaryColor);
    this.currentPolygonID = '#polygon' + this.currentElementsNumber;
    this.createTemporaryRectangle(xPosition, yPosition, 'tempRect', this.rectangleGenerator);
    this.mouseDown = true;
  }

  updateElement(canvasPosX: number, canvasPosY: number, currentPolygonNumber: number) {
    if (this.mouseDown) {
      const currentPolygon = RendererSingleton.renderer.selectRootElement(this.currentPolygonID, true);
      this.rectangleGenerator.updateRectangle(canvasPosX, canvasPosY, currentPolygonNumber);
      const radius: number = this.determineRadius();
      const center: number[] = this.determineCenter(radius);
      const newPoints = this.determinePolygonVertex(center, radius);
      currentPolygon.setAttribute('points', newPoints);
    }
  }

  finishElement() {
    if (this.mouseDown) {
      // Remove the rectangle
      RendererSingleton.canvas.removeChild(RendererSingleton.renderer.selectRootElement(this.TEMP_RECT_ID, true));
      this.currentElementsNumber += 1;
      this.pushGeneratorCommand(this.currentElement);
      this.mouseDown = false;
    }
  }

  // Second layer functions
  private injectInitialHTML(xPosition: number, yPosition: number, primaryColor: string, secondaryColor: string) {
    const point = '' + (xPosition) + ',' + (yPosition);
    const points = point + ' ' + point + ' ' + point;
    const polygon = RendererSingleton.renderer.createElement('polygon', 'svg');
    const properties: [string, string][] = [];
    properties.push(
      ['id', `polygon${this.currentElementsNumber}`],
      ['points', `${points}`],
    );
    this.drawElement(polygon, properties, primaryColor, secondaryColor);
  }

  private determineRadius(): number {
    const tempRect = RendererSingleton.renderer.selectRootElement(this.TEMP_RECT_ID, true);
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

  private determineCenter(radius: number): number[] {
    const tempRect = RendererSingleton.renderer.selectRootElement(this.TEMP_RECT_ID, true);
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

  private determinePolygonVertex(center: number[], radius: number): string {
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

  private setUpAttributes() {
    this.angleBetweenVertex = (2 * Math.PI / this.nbOfApex);
    if (this.nbOfApex % 4 === 0) {
      const cosMax = Math.cos(this.angleBetweenVertex / 2);
      this.adjustment[0] = 1 / cosMax;
      this.aspectRatio = 1;
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
    }
  }

  clone(item: SVGElement): SVGElement {
    const newItem = item.cloneNode() as SVGElement;
    newItem.setAttribute('id', 'polygon' + this.currentPolygonNumber++);
    return newItem;
    }
}
