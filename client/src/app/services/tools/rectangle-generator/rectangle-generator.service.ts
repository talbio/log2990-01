import {Injectable} from '@angular/core';
import {AbstractClosedShape} from '../../../data-structures/abstract-closed-shape';
import {PlotType} from '../../../data-structures/plot-type';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';

@Injectable()
export class RectangleGeneratorService extends AbstractClosedShape  {

  constructor(protected mouse: MousePositionService,
              protected undoRedoService: UndoRedoService) {
    super(mouse, undoRedoService);
  }

  createElement(primaryColor: string, secondaryColor: string) {
    const rect = RendererSingleton.renderer.createElement('rect', 'svg');
    const properties: [string, string][] = [];
    properties.push(
      ['id', `rect${this.currentElementsNumber}`],
      ['x', `${this.xPos}`],
      ['y', `${this.yPos}`],
      ['height', `0`],
      ['width', `0`],
      ['data-start-x', `${this.xPos}`],
      ['data-start-y', `${this.yPos}`],
    );
    this.drawElement(rect, properties, primaryColor, secondaryColor);
    this.mouseDown = true;
  }

  updateElement(currentChildPosition: number, mouseEvent: MouseEvent): void {
    if (mouseEvent.shiftKey) {
      this.updateSquare(currentChildPosition);
    } else {
      this.updateRectangle(currentChildPosition);
    }
  }

  finishElement() {
    if (this.mouseDown) {
      this.currentElementsNumber += 1;
      this.mouseDown = false;
      this.pushGeneratorCommand(this.currentElement);
    }
  }

  createTemporaryRectangle(id: string) {
    this.plotType = PlotType.Contour;
    this.createElement('black', 'black');
    this.currentElement.setAttribute('id', id);
    this.currentElement.setAttribute('stroke-dasharray', '4');
  }

  updateSquare(currentChildPosition: number) {
    if (this.mouseDown) {
      const currentRect = RendererSingleton.canvas.children[currentChildPosition - 1];
      if (currentRect != null) {
        const startRectX: number = Number(currentRect.getAttribute('data-start-x'));
        const startRectY: number = Number(currentRect.getAttribute('data-start-y'));
        const actualWidth: number = this.xPos - startRectX;
        const actualHeight: number = this.yPos - startRectY;
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
            currentRect.setAttribute('x', '' + (this.xPos + Math.abs(actualWidth) - Math.abs(actualHeight)));
          } else {
            // width is bigger, act normal
            currentRect.setAttribute('width', '' + Math.abs(actualWidth));
            currentRect.setAttribute('x', '' + this.xPos);
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
            currentRect.setAttribute('y', '' + (this.yPos + Math.abs(actualHeight) - Math.abs(actualWidth)));
          } else {
            // height is bigger, act normal
            currentRect.setAttribute('height', '' + Math.abs(actualHeight));
            currentRect.setAttribute('y', '' + this.yPos);
          }
        }
      }
    }
  }

  updateRectangle(currentChildPosition: number) {
    if (this.mouseDown) {
      const currentRect = RendererSingleton.canvas.children[currentChildPosition - 1];
      if (currentRect != null) {
        const startRectX: number = Number(currentRect.getAttribute('data-start-x'));
        const startRectY: number = Number(currentRect.getAttribute('data-start-y'));
        const actualWidth: number = this.xPos - startRectX;
        const actualHeight: number = this.yPos - startRectY;
        if (actualWidth >= 0) {
          currentRect.setAttribute('width', '' + actualWidth);
        } else {
          currentRect.setAttribute('width', '' + Math.abs(actualWidth));
          currentRect.setAttribute('x', '' + this.xPos);
        }
        if (actualHeight >= 0) {
          currentRect.setAttribute('height', '' + actualHeight);
        } else {
          currentRect.setAttribute('height', '' + Math.abs(actualHeight));
          currentRect.setAttribute('y', '' + this.yPos);
        }
      }
    }
  }
}
