import { MousePositionService } from './../services/mouse-position/mouse-position.service';
import {RendererSingleton} from '../services/renderer-singleton';
import {UndoRedoService} from '../services/undo-redo/undo-redo.service';
import {AbstractGenerator} from './abstract-generator';

export abstract class AbstractWritingTool extends AbstractGenerator {

  private readonly DEFAULT_WIDTH = 5;

  protected strokeWidth: number;
  protected mouseDown: boolean;

  constructor(protected mouse: MousePositionService,
              protected undoRedoService: UndoRedoService) {
    super(mouse, undoRedoService);
    this.mouseDown = false;
    this.strokeWidth = this.DEFAULT_WIDTH;
  }

  /**
   * @desc Updates the path when the mouse is moving (mousedown)
   */
  updatePath(currentChildPosition: number) {
    if (this.mouseDown) {
      const currentPath = RendererSingleton.canvas.children[currentChildPosition - 1];
      if (currentPath != null) {
        currentPath.setAttribute('d',
          currentPath.getAttribute('d') + ' L' + (this.mouse.canvasMousePositionX) +
          ' ' + (this.mouse.canvasMousePositionY));
      }
    }
  }

  /**
   * @desc Finalizes the path, sets up the next one
   */
  finishElement(mouseEvent?: MouseEvent): void {
    if (this.mouseDown) {
      this.currentElementsNumber += 1;
      this.pushGeneratorCommand(this.currentElement);
      this.mouseDown = false;
    }
  }

  drawElement(element: SVGElement, properties: [string, string][]) {
    for (const property of properties) {
      RendererSingleton.renderer.setAttribute(element, property[0], property[1]);
    }
    this.currentElement = element;
    RendererSingleton.renderer.appendChild(RendererSingleton.canvas, element);
  }
}
