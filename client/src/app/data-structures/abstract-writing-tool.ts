import {RendererSingleton} from '../services/renderer-singleton';
import {UndoRedoService} from '../services/undo-redo/undo-redo.service';
import {AbstractGenerator} from './abstract-generator';

export abstract class AbstractWritingTool extends AbstractGenerator {

  private readonly DEFAULT_WIDTH = 5;

  protected OFFSET_CANVAS_X: number;
  protected OFFSET_CANVAS_Y: number;
  protected strokeWidth: number;
  protected mouseDown: boolean;
  protected currentElement: SVGElement;

  protected constructor(protected undoRedoService: UndoRedoService) {
    super(undoRedoService);
    this.mouseDown = false;
    this.strokeWidth = this.DEFAULT_WIDTH;
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
