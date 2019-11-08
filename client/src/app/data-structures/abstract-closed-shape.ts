import { MousePositionService } from './../services/mouse-position/mouse-position.service';
import {RendererSingleton} from '../services/renderer-singleton';
import {UndoRedoService} from '../services/undo-redo/undo-redo.service';
import {Action, ActionType} from './command';
import {PlotType} from './plot-type';

export class AbstractClosedShape {

  /**
   * @desc: the current element being rendered
   */
  protected currentElement: SVGElement;
  protected plotType: PlotType;
  protected strokeWidth: number;

  constructor(protected mouse: MousePositionService,
              protected undoRedoService: UndoRedoService) {}

  get x(): number {
    return this.mouse.canvasMousePositionX;
  }

  get y(): number {
    return this.mouse.canvasMousePositionY;
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

  setStrokeFillProperties(element: SVGElement, primaryColor: string, secondaryColor: string): void {
    let stroke = '';
    let fill = '';
    switch (this.plotType) {
      case PlotType.Contour:
        stroke = secondaryColor;
        fill = 'transparent';
        break;
      case PlotType.Full:
        stroke = 'transparent';
        fill = primaryColor;
        break;
      case PlotType.FullWithContour:
        stroke = secondaryColor;
        fill = primaryColor;
        break;
    }
    RendererSingleton.renderer.setAttribute(element, 'stroke', `${stroke}`);
    RendererSingleton.renderer.setAttribute(element, 'stroke-width', `${this.strokeWidth}`);
    RendererSingleton.renderer.setAttribute(element, 'fill', `${fill}`);
  }

  setProperties(element: SVGElement, properties: [string, string][]): void {
    for (const property of properties) {
      RendererSingleton.renderer.setAttribute(element, property[0], property[1]);
    }
  }

  drawElement(element: SVGElement, properties: [string, string][], primaryColor: string, secondaryColor: string): void {
    this.setProperties(element, properties);
    this.setStrokeFillProperties(element, primaryColor, secondaryColor);
    RendererSingleton.renderer.appendChild(RendererSingleton.getCanvas(), element);
    this.currentElement = element;
    }
}
