import { Injectable} from '@angular/core';
import {AbstractClosedShape} from '../../../data-structures/abstract-closed-shape';
import {ActionGenerator} from '../../../data-structures/command';
import { PlotType } from '../../../data-structures/plot-type';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';

enum Axis {
  x,
  y,
}

@Injectable()
export class EllipseGeneratorService extends AbstractClosedShape implements ActionGenerator {

  private readonly TEMP_RECT_ID = '#tempRect';

  private OFFSET_CANVAS_Y: number;
  private OFFSET_CANVAS_X: number;
  private currentEllipseNumber: number;
  private mouseDown: boolean;

  constructor(private rectangleGenerator: RectangleGeneratorService,
              undoRedoService: UndoRedoService) {
    super(undoRedoService);
    this.strokeWidth = 1;
    this.plotType = PlotType.Contour;
    this.currentEllipseNumber = 0;
    this.mouseDown = false;
  }

  // Getters/Setters
  get _strokeWidth() { return this.strokeWidth; }
  set _strokeWidth(width: number) { this.strokeWidth = width; }

  get _plotType() { return this.plotType; }
  set _plotType(plotType: PlotType) { this.plotType = plotType; }

  set _currentEllipseNumber(count: number) { this.currentEllipseNumber = count; }

  // Primary methods
  createEllipse(mouseEvent: MouseEvent, canvas: SVGElement, primaryColor: string, secondaryColor: string): boolean {
    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;
    const xPos = mouseEvent.pageX - this.OFFSET_CANVAS_X;
    const yPos = mouseEvent.pageY - this.OFFSET_CANVAS_Y;
    this.generateEllipseElement(this.currentEllipseNumber, xPos, yPos, primaryColor, secondaryColor);
    this.createTemporaryRectangle(mouseEvent, canvas);
    this.mouseDown = true;
    return true;
  }

  updateCircle(canvasPosX: number, canvasPosY: number, canvas: SVGElement, currentChildPosition: number): void {
    if (this.mouseDown) {
      this.rectangleGenerator.updateSquare(canvasPosX, canvasPosY, canvas, currentChildPosition);
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

  updateEllipse(canvasPosX: number, canvasPosY: number, canvas: SVGElement, currentChildPosition: number) {
    if (this.mouseDown) {
      this.rectangleGenerator.updateRectangle(canvasPosX, canvasPosY, canvas, currentChildPosition);
      const tempRect = RendererSingleton.renderer.selectRootElement(this.TEMP_RECT_ID, true);
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
      RendererSingleton.getCanvas().removeChild(RendererSingleton.renderer.selectRootElement(this.TEMP_RECT_ID, true));
      this.currentEllipseNumber += 1;
      this.pushAction(this.currentElement);
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

  createTemporaryRectangle(mouseEvent: MouseEvent, canvas: SVGElement) {
    this.rectangleGenerator._plotType = PlotType.Contour;
    this.rectangleGenerator.createRectangle(mouseEvent, canvas, 'black', 'black');
    canvas.children[canvas.children.length - 1].id = 'tempRect';
    canvas.children[canvas.children.length - 1].setAttribute('stroke-dasharray', '4');
  }
}
