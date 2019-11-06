import { Injectable} from '@angular/core';
import {AbstractClosedShape} from '../../../data-structures/abstract-closed-shape';
import { PlotType } from '../../../data-structures/plot-type';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';

enum Axis {
  x,
  y,
}

@Injectable()
export class EllipseGeneratorService extends AbstractClosedShape {

  private readonly TEMP_RECT_ID = '#tempRect';

  constructor(protected undoRedoService: UndoRedoService,
              private rectangleGenerator: RectangleGeneratorService) {
    super(undoRedoService);
  }

  // Getters/Setters
  get _strokeWidth() { return this.strokeWidth; }
  set _strokeWidth(width: number) { this.strokeWidth = width; }

  get _plotType() { return this.plotType; }
  set _plotType(plotType: PlotType) { this.plotType = plotType; }

  set _currentEllipseNumber(count: number) { this.currentElementsNumber = count; }

  // Primary methods
  createElement(mouseEvent: MouseEvent, primaryColor: string, secondaryColor: string) {
    this.OFFSET_CANVAS_Y = RendererSingleton.canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = RendererSingleton.canvas.getBoundingClientRect().left;
    const xPos = mouseEvent.pageX - this.OFFSET_CANVAS_X;
    const yPos = mouseEvent.pageY - this.OFFSET_CANVAS_Y;
    this.generateEllipseElement(this.currentElementsNumber, xPos, yPos, primaryColor, secondaryColor);
    this.createTemporaryRectangle(mouseEvent, this.rectangleGenerator);
    this.mouseDown = true;
  }

  updateElement(canvasPosX: number, canvasPosY: number, currentChildPosition: number) {
    if (this.mouseDown) {
      this.rectangleGenerator.updateRectangle(canvasPosX, canvasPosY, currentChildPosition);
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

  finishElement() {
    if (this.mouseDown) {
      RendererSingleton.canvas.removeChild(RendererSingleton.renderer.selectRootElement(this.TEMP_RECT_ID, true));
      this.currentElementsNumber += 1;
      this.pushGeneratorCommand(this.currentElement);
      this.mouseDown = false;
    }
  }

  updateCircle(canvasPosX: number, canvasPosY: number, canvas: SVGElement, currentChildPosition: number): void {
    if (this.mouseDown) {
      this.rectangleGenerator.updateSquare(canvasPosX, canvasPosY, currentChildPosition);
      const tempRect = RendererSingleton.renderer.selectRootElement(this.TEMP_RECT_ID, true);
      const x: number = parseFloat(tempRect.getAttribute('x') as string);
      const y: number = parseFloat(tempRect.getAttribute('y') as string);
      const h: number = parseFloat(tempRect.getAttribute('height') as string);
      const currentEllipse = canvas.children[currentChildPosition - 2] as SVGElement;
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

  private generateEllipseElement(id: number, xPos: number, yPos: number, primaryColor: string, secondaryColor: string): void {
    const ellipse = RendererSingleton.renderer.createElement('ellipse', 'svg');
    const properties: [string, string][] = [];
    properties.push(
      ['id', `ellipse${id.toString()}`],
      ['cx', `${xPos.toString()}`],
      ['cy', `${yPos.toString()}`],
      ['rx', `0`],
      ['ry', `0`],
      ['data-start-x', `${xPos.toString()}`],
      ['data-start-y', `${yPos.toString()}`],
    );
    this.drawElement(ellipse, properties, primaryColor, secondaryColor);

  }
}
