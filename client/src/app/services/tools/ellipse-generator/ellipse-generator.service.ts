import { MousePositionService } from './../../mouse-position/mouse-position.service';
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

  private currentEllipseNumber: number;
  private canvasElement: SVGElement;
  private renderer: Renderer2;
  private mouseDown: boolean;

  // attributes of ellipse
  private strokeWidth: number;
  private plotType: PlotType;

  constructor(private rectangleGenerator: RectangleGeneratorService,
              private mousePosition: MousePositionService) {
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
  createEllipse(canvas: SVGElement, primaryColor: string, secondaryColor: string) {
    this.canvasElement = canvas;
    canvas.innerHTML += this.generateEllipseElement(this.currentEllipseNumber, primaryColor, secondaryColor);
    this.createTemporaryRectangle(canvas);
    this.mouseDown = true;
    return true;
  }

  updateCircle(canvas: SVGElement, currentChildPosition: number) {
    if (this.mouseDown) {
      this.rectangleGenerator.updateSquare(canvas, currentChildPosition);
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

  updateEllipse(canvas: SVGElement, currentChildPosition: number) {
    if (this.mouseDown) {
      this.rectangleGenerator.updateRectangle(canvas, currentChildPosition);
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

  private generateEllipseElement(id: number, primaryColor: string, secondaryColor: string): string {
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
        data-start-x = '${this.mousePosition.canvasMousePositionX}'
        data-start-y = '${this.mousePosition.canvasMousePositionY}'
        cx='${this.mousePosition.canvasMousePositionX}'
        cy='${this.mousePosition.canvasMousePositionY}' rx='0' ry='0'
        stroke='${strokeProperty}' stroke-width='${this.strokeWidth}' fill='${fillProperty}'></ellipse>`;
  }

  createTemporaryRectangle(canvas: SVGElement) {
    this.rectangleGenerator._plotType = PlotType.Contour;
    this.rectangleGenerator.createRectangle(canvas, 'black', 'black');
    canvas.children[canvas.children.length - 1].id = 'tempRect';
    canvas.children[canvas.children.length - 1].setAttribute('stroke-dasharray', '4');
  }

  clone(item: SVGElement) {
    const x = parseFloat(item.getAttribute('cx') as unknown as string) + 10;
    const y = parseFloat(item.getAttribute('cy') as unknown as string) + 10;
    const h = parseFloat(item.getAttribute('ry') as unknown as string);
    const w = parseFloat(item.getAttribute('rx') as unknown as string);
    const color1 = item.getAttribute('fill');
    const color2 = item.getAttribute('stroke');
    const strokeWidth = item.getAttribute('stroke-width');
    const newItem =
        `<rect id="rect${this.currentEllipseNumber}"
        cx="${x}" data-start-x="${x}"
        cy="${y}" data-start-y="${y}"
        rx="${w}" ry="${h}" stroke="${color2}" stroke-width="${strokeWidth}"
        fill="${color1}"></rect>`;
    this.currentEllipseNumber++;
    return newItem;
  }
}
