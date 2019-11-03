import {Injectable} from '@angular/core';
import {AbstractClosedShape} from '../../../data-structures/abstract-closed-shape';
import {Action, ActionGenerator, ActionType} from '../../../data-structures/command';
import {PlotType} from '../../../data-structures/plot-type';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';

@Injectable()
export class RectangleGeneratorService extends AbstractClosedShape implements ActionGenerator  {

  private OFFSET_CANVAS_Y: number;
  private OFFSET_CANVAS_X: number;
  private currentRectNumber: number;
  private mouseDown: boolean;

  constructor(undoRedoService: UndoRedoService) {
    super(undoRedoService);
    this.strokeWidth = 1;
    this.plotType = PlotType.Contour;
    this.currentRectNumber = 0;
    this.mouseDown = false;
  }

  set _currentRectNumber(count: number) { this.currentRectNumber = count; }
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

  pushAction(svgElement: SVGElement): void {
    const action: Action = {
      actionType: ActionType.Create,
      svgElements: [svgElement],
      execute(): void {
        RendererSingleton.renderer.appendChild(RendererSingleton.getCanvas(), this.svgElements[0]);
      },
      unexecute(): void {
        RendererSingleton.renderer.removeChild(RendererSingleton.getCanvas(), this.svgElements[0]);
      },
    };
    this.undoRedoService.pushAction(action);
  }

  createRectangle(mouseEvent: MouseEvent, canvas: SVGElement, primaryColor: string, secondaryColor: string) {

    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;
    const xPos = mouseEvent.pageX - this.OFFSET_CANVAS_X;
    const yPos = mouseEvent.pageY - this.OFFSET_CANVAS_Y;

    const rect = RendererSingleton.renderer.createElement('rect', 'svg');
    const properties: [string, string][] = [];
    properties.push(
      ['id', `rect${this.currentRectNumber}`],
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

  updateSquare(canvasPosX: number, canvasPosY: number, canvas: SVGElement, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentRect = canvas.children[currentChildPosition - 1];
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

  updateRectangle(canvasPosX: number, canvasPosY: number, canvas: SVGElement, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentRect = canvas.children[currentChildPosition - 1];
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

  finishRectangle() {
    if (this.mouseDown) {
      this.currentRectNumber += 1;
      this.mouseDown = false;
      this.pushAction(this.currentElement);
    }
  }

}
