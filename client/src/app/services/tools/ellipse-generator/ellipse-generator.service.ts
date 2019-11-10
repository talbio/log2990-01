import { Injectable} from '@angular/core';
import {AbstractClosedShape} from '../../../data-structures/abstract-closed-shape';
import {MousePositionService} from '../../mouse-position/mouse-position.service';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';
import { RectangleGeneratorService } from '../rectangle-generator/rectangle-generator.service';

enum Axis {
  x,
  y,
}

@Injectable()
export class EllipseGeneratorService extends AbstractClosedShape {

  private readonly TEMP_RECT_ID = 'tempRect';

  constructor(private rectangleGenerator: RectangleGeneratorService,
              protected undoRedoService: UndoRedoService,
              protected mouse: MousePositionService) {
    super(mouse, undoRedoService);
  }

  get tempRect(): SVGElement {
    return RendererSingleton.renderer.selectRootElement('#' + this.TEMP_RECT_ID);
  }

  // Primary methods
  createElement(primaryColor: string, secondaryColor: string) {
    this.generateEllipseElement(primaryColor, secondaryColor);
    this.rectangleGenerator.createTemporaryRectangle(this.TEMP_RECT_ID);
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
      RendererSingleton.canvas.removeChild(this.tempRect);
      this.currentElementsNumber += 1;
      this.pushGeneratorCommand(this.currentElement);
      this.mouseDown = false;
    }
  }

  updateEllipse(currentChildPosition: number) {
    if (this.mouseDown) {
      this.rectangleGenerator.updateRectangle(currentChildPosition);
      const x: number = parseFloat(this.tempRect.getAttribute('x') as string);
      const y: number = parseFloat(this.tempRect.getAttribute('y') as string);
      const w: number = parseFloat(this.tempRect.getAttribute('width') as string);
      const h: number = parseFloat(this.tempRect.getAttribute('height') as string);
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
      const x: number = parseFloat(this.tempRect.getAttribute('x') as string);
      const y: number = parseFloat(this.tempRect.getAttribute('y') as string);
      const h: number = parseFloat(this.tempRect.getAttribute('height') as string);
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
      ['id', `ellipse${this.currentElementsNumber}`],
      ['cx', `${this.xPos}`],
      ['cy', `${this.yPos}`],
      ['rx', `0`],
      ['ry', `0`],
      ['data-start-x', `${this.xPos}`],
      ['data-start-y', `${this.yPos}`],
    );
    this.drawElement(ellipse, properties, primaryColor, secondaryColor);
  }
}
