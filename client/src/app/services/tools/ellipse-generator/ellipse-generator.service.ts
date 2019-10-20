import { Injectable, Renderer2 } from '@angular/core';
import { PlotType } from '../../../data-structures/PlotType';
import { RectangleGeneratorService } from './../rectangle-generator/rectangle-generator.service';

enum Axis {
  x,
  y,
}

@Injectable()
export class EllipseGeneratorService {

  private readonly TEMP_RECT_ID = '#tempRect';

  private OFFSET_CANVAS_Y: number;
  private OFFSET_CANVAS_X: number;
  private currentEllipseNumber: number;
  private canvasElement: SVGElement;
  private renderer: Renderer2;
  private mouseDown: boolean;

  // attributes of rectangle
  private strokeWidth: number;
  private plotType: PlotType;

  constructor(private rectangleGenerator: RectangleGeneratorService) {
    this.strokeWidth = 1;
    this.plotType = PlotType.Contour;
    this.currentEllipseNumber = 0;
    this.mouseDown = false;
  }

  // Getters/Setters
  set _renderer(renderer: Renderer2) { this.renderer = renderer; }

  get _strokeWidth() { return this.strokeWidth; }
  set _strokeWidth(width: number) { this.strokeWidth = width; }

  get _plotType() { return this.plotType; }
  set _plotType(plotType: PlotType) { this.plotType = plotType; }

  set _currentEllipseNumber(count: number) { this.currentEllipseNumber = count; }

  // Primary methods
  createEllipse(mouseEvent: MouseEvent, canvas: SVGElement, primaryColor: string, secondaryColor: string) {
    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;
    this.canvasElement = canvas;
    const xPos = mouseEvent.pageX - this.OFFSET_CANVAS_X;
    const yPos = mouseEvent.pageY - this.OFFSET_CANVAS_Y;
    canvas.innerHTML += this.generateEllipseElement(this.currentEllipseNumber, xPos, yPos, primaryColor, secondaryColor);
    this.createTemporaryRectangle(mouseEvent, canvas);
    this.mouseDown = true;
    return true;
  }

  updateCircle(canvasPosX: number, canvasPosY: number, canvas: SVGElement, currentChildPosition: number) {
    if (this.mouseDown) {
      this.rectangleGenerator.updateSquare(canvasPosX, canvasPosY, canvas, currentChildPosition);
      const tempRect = this.renderer.selectRootElement(this.TEMP_RECT_ID, true);
      const x: number = parseFloat(tempRect.getAttribute('x') as string);
      const y: number = parseFloat(tempRect.getAttribute('y') as string);
      const h: number = parseFloat(tempRect.getAttribute('height') as string);
      const currentEllipse = canvas.children[currentChildPosition - 2] as SVGElement;
      const radius: number = h / 2;
      this.setAxisAttributes(currentEllipse, Axis.x, radius, x + radius);
      this.setAxisAttributes(currentEllipse, Axis.y, radius, y + radius);
    }
  }

  updateEllipse(canvasPosX: number, canvasPosY: number, canvas: SVGElement, currentChildPosition: number) {
    if (this.mouseDown) {
      this.rectangleGenerator.updateRectangle(canvasPosX, canvasPosY, canvas, currentChildPosition);
      const tempRect = this.renderer.selectRootElement(this.TEMP_RECT_ID, true);
      const x: number = parseFloat(tempRect.getAttribute('x') as string);
      const y: number = parseFloat(tempRect.getAttribute('y') as string);
      const w: number = parseFloat(tempRect.getAttribute('width') as string);
      const h: number = parseFloat(tempRect.getAttribute('height') as string);
      const currentEllipse = canvas.children[currentChildPosition - 2] as SVGElement;
      const radiusWidth: number = w / 2;
      const radiusHeight: number = h / 2;
      // Setting
      if (radiusWidth >= 0) {
        this.setAxisAttributes(currentEllipse, Axis.x, radiusWidth, x + radiusWidth);
      } else {
        this.setAxisAttributes(currentEllipse, Axis.x, radiusWidth, x + radiusWidth);
      }
      if (radiusHeight >= 0) {
        this.setAxisAttributes(currentEllipse, Axis.y, radiusHeight, y + radiusHeight);
      } else {
        this.setAxisAttributes(currentEllipse, Axis.y, radiusHeight, y + radiusHeight);
      }
    }
  }

  finishEllipse() {
    if (this.mouseDown) {
      this.canvasElement.removeChild(this.renderer.selectRootElement(this.TEMP_RECT_ID, true));
      this.currentEllipseNumber += 1;
      this.mouseDown = false;
    }
  }

  private setAxisAttributes(currentEllipse: SVGElement, axis: Axis, radiusValue: number, positionValue: number): void {
    if (axis === Axis.x) {
      currentEllipse.setAttribute('rx', radiusValue.toString());
      currentEllipse.setAttribute('cx', positionValue.toString());
    } else {
      currentEllipse.setAttribute('ry', radiusValue.toString());
      currentEllipse.setAttribute('cy', positionValue.toString());
    }
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

  createTemporaryRectangle(mouseEvent: MouseEvent, canvas: SVGElement) {
    this.rectangleGenerator._plotType = PlotType.Contour;
    this.rectangleGenerator.createRectangle(mouseEvent, canvas, 'black', 'black');
    canvas.children[canvas.children.length - 1].id = 'tempRect';
    canvas.children[canvas.children.length - 1].setAttribute('stroke-dasharray', '4');
  }
}
