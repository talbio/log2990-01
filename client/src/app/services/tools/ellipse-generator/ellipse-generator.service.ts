import { Injectable} from '@angular/core';
import {AbstractClosedShape} from '../../../data-structures/abstract-closed-shape';
import { PlotType } from '../../../data-structures/plot-type';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';
import { MousePositionService } from './../../mouse-position/mouse-position.service';

enum Axis {
  x,
  y,
}

@Injectable()
export class EllipseGeneratorService extends AbstractClosedShape {

  private readonly TEMP_RECT_ID = '#tempRect';

  private currentEllipseNumber: number;
  protected mouseDown: boolean;

  constructor(private rectangleGenerator: RectangleGeneratorService,
              private mousePosition: MousePositionService,
              undoRedoService: UndoRedoService) {
    super(mousePosition, undoRedoService);
    this.currentEllipseNumber = 0;
    this.mouseDown = false;
  }

  // Getters/Setters
  get _strokeWidth() { return this.strokeWidth; }
  set _strokeWidth(width: number) { this.strokeWidth = width; }

  get _plotType() { return this.plotType; }
  set _plotType(plotType: PlotType) { this.plotType = plotType; }

  set _currentEllipseNumber(count: number) { this.currentElementsNumber = count; }

  // Primary methods
  createElement(primaryColor: string, secondaryColor: string) {
    this.generateEllipseElement(primaryColor, secondaryColor);
    this.createTemporaryRectangle(this.rectangleGenerator);
    this.mouseDown = true;
  }

  updateElement(currentChildPosition: number, mouseEvent: MouseEvent): void {
    if (mouseEvent.shiftKey) {
      this.updateCircle(currentChildPosition);
    } else {
      this.updateEllipse(currentChildPosition);
    }
  }

  finishElement() {
    if (this.mouseDown) {
      RendererSingleton.canvas.removeChild(RendererSingleton.renderer.selectRootElement(this.TEMP_RECT_ID, true));
      this.currentElementsNumber += 1;
      this.pushGeneratorCommand(this.currentElement);
      this.mouseDown = false;
    }
  }

  updateEllipse(currentChildPosition: number) {
    if (this.mouseDown) {
      this.rectangleGenerator.updateRectangle(currentChildPosition);
      const tempRect = RendererSingleton.renderer.selectRootElement(this.TEMP_RECT_ID, true);
      const x: number = parseFloat(tempRect.getAttribute('x') as string);
      const y: number = parseFloat(tempRect.getAttribute('y') as string);
      const w: number = parseFloat(tempRect.getAttribute('width') as string);
      const h: number = parseFloat(tempRect.getAttribute('height') as string);
      const currentEllipse = RendererSingleton.canvas.children[currentChildPosition - 2] as SVGElement;
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

  updateCircle(currentChildPosition: number): void {
    if (this.mouseDown) {
      this.rectangleGenerator.updateSquare(currentChildPosition);
      const tempRect = RendererSingleton.renderer.selectRootElement(this.TEMP_RECT_ID, true);
      const x: number = parseFloat(tempRect.getAttribute('x') as string);
      const y: number = parseFloat(tempRect.getAttribute('y') as string);
      const h: number = parseFloat(tempRect.getAttribute('height') as string);
      const currentEllipse = RendererSingleton.canvas.children[currentChildPosition - 2] as SVGElement;
      const radius: number = h / 2;
      this.setAxisAttributes(currentEllipse, Axis.x, radius, x + radius);
      this.setAxisAttributes(currentEllipse, Axis.y, radius, y + radius);
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

  private generateEllipseElement(primaryColor: string, secondaryColor: string): void {
    const ellipse = RendererSingleton.renderer.createElement('ellipse', 'svg');
    const properties: [string, string][] = [];
    properties.push(
      ['id', `ellipse${this.currentEllipseNumber}`],
      ['cx', `${this.mousePosition.canvasMousePositionX}`],
      ['cy', `${this.mousePosition.canvasMousePositionY}`],
      ['rx', `0`],
      ['ry', `0`],
      ['data-start-x', `${this.mousePosition.canvasMousePositionX}`],
      ['data-start-y', `${this.mousePosition.canvasMousePositionY}`],
    );
    this.drawElement(ellipse, properties, primaryColor, secondaryColor);

  }

  clone(item: SVGElement): SVGElement {
    const newItem = item.cloneNode() as SVGElement;
    newItem.setAttribute('id', 'ellipse' + this.currentEllipseNumber++);
    return newItem;
  }
}
