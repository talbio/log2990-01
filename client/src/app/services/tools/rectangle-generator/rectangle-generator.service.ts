import { MousePositionService } from './../../mouse-position/mouse-position.service';
import {Injectable} from '@angular/core';
import {AbstractClosedShape} from '../../../data-structures/abstract-closed-shape';
import {PlotType} from '../../../data-structures/plot-type';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';

@Injectable()
export class RectangleGeneratorService extends AbstractClosedShape  {

  constructor(protected undoRedoService: UndoRedoService) {
    super(undoRedoService);
  }

  get _strokeWidth() {
    return this.strokeWidth;
  }

  set _strokeWidth(width: number) {
    this.strokeWidth = width;
  }

  get _plotType() {
    return this.plotType;
  }

  set _plotType(plotType: PlotType) {
    this.plotType = plotType;
  }

  createElement(xPosition: number, yPosition: number, primaryColor: string, secondaryColor: string) {
    const rect = RendererSingleton.renderer.createElement('rect', 'svg');
    const properties: [string, string][] = [];
    properties.push(
      ['id', `rect${this.currentElementsNumber}`],
      ['x', `${xPosition}`],
      ['y', `${yPosition}`],
      ['height', `0`],
      ['width', `0`],
      ['data-start-x', `${xPosition}`],
      ['data-start-y', `${yPosition}`],
    );
    this.drawElement(rect, properties, primaryColor, secondaryColor);
    this.mouseDown = true;
  }

  updateElement(xPosition: number, yPosition: number, currentChildPosition: number, mouseEvent: MouseEvent): void {
    if (mouseEvent.shiftKey) {
      this.updateSquare(xPosition, yPosition, currentChildPosition);
    } else {
      this.updateRectangle(xPosition, yPosition, currentChildPosition);
    }
  }

  finishElement() {
    if (this.mouseDown) {
      this.currentElementsNumber += 1;
      this.mouseDown = false;
      this.pushGeneratorCommand(this.currentElement);
    }
  }

  updateSquare(canvasPosX: number, canvasPosY: number, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentRect = RendererSingleton.canvas.children[currentChildPosition - 1];
      if (currentRect != null) {
        const startRectX: number = Number(currentRect.getAttribute('data-start-x'));
        const startRectY: number = Number(currentRect.getAttribute('data-start-y'));
        const actualWidth: number = this.mouse.canvasMousePositionX - startRectX;
        const actualHeight: number = this.mouse.canvasMousePositionY - startRectY;
        if (actualWidth >= 0) {
          if (Math.abs(actualHeight) > Math.abs(actualWidth)) {
            // height is bigger
            currentRect.setAttribute('width', '' + Math.abs(actualHeight));
          } else {
            // width is bigger, act normal
            currentRect.setAttribute('width', '' + actualWidth);
          }
        } else {
          if (Math.abs(actualHeight) > Math.abs(actualWidth)) {
            // height is bigger
            currentRect.setAttribute('width', '' + Math.abs(actualHeight));
            currentRect.setAttribute('x', '' + (this.mouse.canvasMousePositionX + Math.abs(actualWidth) - Math.abs(actualHeight)));
          } else {
            // width is bigger, act normal
            currentRect.setAttribute('width', '' + Math.abs(actualWidth));
            currentRect.setAttribute('x', '' + this.mouse.canvasMousePositionX);
          }
        }
        if (actualHeight >= 0) {
          if (Math.abs(actualWidth) > Math.abs(actualHeight)) {
            // width is bigger
            currentRect.setAttribute('height', '' + Math.abs(actualWidth));
          } else {
            // height is bigger, act normal
            currentRect.setAttribute('height', '' + actualHeight);
          }
        } else {
          if (Math.abs(actualWidth) > Math.abs(actualHeight)) {
            // width is bigger
            currentRect.setAttribute('height', '' + Math.abs(actualWidth));
            currentRect.setAttribute('y', '' + (this.mouse.canvasMousePositionY + Math.abs(actualHeight) - Math.abs(actualWidth)));
          } else {
            // height is bigger, act normal
            currentRect.setAttribute('height', '' + Math.abs(actualHeight));
            currentRect.setAttribute('y', '' + this.mouse.canvasMousePositionY);
          }
        }
      }
    }
  }

  updateRectangle(canvasPosX: number, canvasPosY: number, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentRect = RendererSingleton.canvas.children[currentChildPosition - 1];
      if (currentRect != null) {
        const startRectX: number = Number(currentRect.getAttribute('data-start-x'));
        const startRectY: number = Number(currentRect.getAttribute('data-start-y'));
        const actualWidth: number = this.mouse.canvasMousePositionX - startRectX;
        const actualHeight: number = this.mouse.canvasMousePositionY - startRectY;
        if (actualWidth >= 0) {
          currentRect.setAttribute('width', '' + actualWidth);
        } else {
          currentRect.setAttribute('width', '' + Math.abs(actualWidth));
          currentRect.setAttribute('x', '' + this.mouse.canvasMousePositionX);
        }
        if (actualHeight >= 0) {
          currentRect.setAttribute('height', '' + actualHeight);
        } else {
          currentRect.setAttribute('height', '' + Math.abs(actualHeight));
          currentRect.setAttribute('y', '' + this.mouse.canvasMousePositionY);
        }
      }
    }
  }

}
