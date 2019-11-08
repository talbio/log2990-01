import { MousePositionService } from './../services/mouse-position/mouse-position.service';
import {RendererSingleton} from '../services/renderer-singleton';
import {UndoRedoService} from '../services/undo-redo/undo-redo.service';
import {Action, ActionType} from './command';

export class AbstractWritingTool {

  private readonly DEFAULT_WIDTH = 5;

  protected strokeWidth: number;
  protected mouseDown: boolean;
  protected currentElement: SVGElement;

  constructor(protected mouse: MousePositionService,
              protected undoRedoService: UndoRedoService) {
    this.mouseDown = false;
    this.strokeWidth = this.DEFAULT_WIDTH;
  }

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

  /**
   * @desc // Updates the path when the mouse is moving (mousedown)
   */
  updatePath(currentChildPosition: number) {
    if (this.mouseDown) {
      const currentPath = RendererSingleton.getCanvas().children[currentChildPosition - 1];
      if (currentPath != null) {
        currentPath.setAttribute('d',
          currentPath.getAttribute('d') + ' L' + (this.mouse.canvasMousePositionX) +
          ' ' + (this.mouse.canvasMousePositionY));
      }
    }
  }

  drawElement(element: SVGElement, properties: [string, string][]) {
    for (const property of properties) {
      RendererSingleton.renderer.setAttribute(element, property[0], property[1]);
    }
    this.currentElement = element;
    RendererSingleton.renderer.appendChild(RendererSingleton.getCanvas(), element);
  }
}
