import {RendererSingleton} from '../services/renderer-singleton';
import {UndoRedoService} from '../services/undo-redo/undo-redo.service';
import {Action, ActionType} from './command';

export class AbstractWritingTool {

  protected readonly DEFAULT_WIDTH = 5;

  OFFSET_CANVAS_X: number;
  OFFSET_CANVAS_Y: number;
  strokeWidth: number;
  mouseDown: boolean;
  currentElement: SVGElement;

  constructor(protected undoRedoService: UndoRedoService) {
    this.mouseDown = false;
    this.strokeWidth = this.DEFAULT_WIDTH;
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
  updatePath(mouseEvent: MouseEvent, currentChildPosition: number) {
    if (this.mouseDown) {
      const currentPath = RendererSingleton.getCanvas().children[currentChildPosition - 1];
      if (currentPath != null) {
        currentPath.setAttribute('d',
          currentPath.getAttribute('d') + ' L' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
          ' ' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y));
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
