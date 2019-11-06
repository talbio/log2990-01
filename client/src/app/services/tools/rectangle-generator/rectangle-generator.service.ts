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

  set _currentRectNumber(count: number) { this.currentElementsNumber = count; }
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

  createElement(mouseEvent: MouseEvent, primaryColor: string, secondaryColor: string) {

    this.OFFSET_CANVAS_Y = RendererSingleton.canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = RendererSingleton.canvas.getBoundingClientRect().left;
    const xPos = mouseEvent.pageX - this.OFFSET_CANVAS_X;
    const yPos = mouseEvent.pageY - this.OFFSET_CANVAS_Y;

    const rect = RendererSingleton.renderer.createElement('rect', 'svg');
    const properties: [string, string][] = [];
    properties.push(
      ['id', `rect${this.currentElementsNumber}`],
      ['x', `${xPos}`],
      ['y', `${yPos}`],
      ['height', `0`],
      ['width', `0`],
      ['data-start-x', `${xPos}`],
      ['data-start-y', `${yPos}`],
    );
    this.drawElement(rect, properties, primaryColor, secondaryColor);
    this.mouseDown = true;
  }

  updateElement(canvasPosX: number, canvasPosY: number, currentChildPosition: number, mouseEvent: MouseEvent): void {
    if (mouseEvent.shiftKey) {
      this.updateSquare(canvasPosX, canvasPosY, currentChildPosition);
    } else {
      this.updateRectangle(canvasPosX, canvasPosY, currentChildPosition);
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
        const actualWidth: number = canvasPosX - startRectX;
        const actualHeight: number = canvasPosY - startRectY;
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
            currentRect.setAttribute('x', '' + (canvasPosX + Math.abs(actualWidth) - Math.abs(actualHeight)));
          } else {
            // width is bigger, act normal
            currentRect.setAttribute('width', '' + Math.abs(actualWidth));
            currentRect.setAttribute('x', '' + canvasPosX);
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
            currentRect.setAttribute('y', '' + (canvasPosY + Math.abs(actualHeight) - Math.abs(actualWidth)));
          } else {
            // height is bigger, act normal
            currentRect.setAttribute('height', '' + Math.abs(actualHeight));
            currentRect.setAttribute('y', '' + canvasPosY);
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
        const actualWidth: number = canvasPosX - startRectX;
        const actualHeight: number = canvasPosY - startRectY;
        if (actualWidth >= 0) {
          currentRect.setAttribute('width', '' + actualWidth);
        } else {
          currentRect.setAttribute('width', '' + Math.abs(actualWidth));
          currentRect.setAttribute('x', '' + canvasPosX);
        }
        if (actualHeight >= 0) {
          currentRect.setAttribute('height', '' + actualHeight);
        } else {
          currentRect.setAttribute('height', '' + Math.abs(actualHeight));
          currentRect.setAttribute('y', '' + canvasPosY);
        }
      }
    }
  }

}
