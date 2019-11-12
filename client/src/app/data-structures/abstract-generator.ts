import {RendererSingleton} from '../services/renderer-singleton';
import {UndoRedoService} from '../services/undo-redo/undo-redo.service';
import { MousePositionService } from './../services/mouse-position/mouse-position.service';
import {Command, CommandGenerator} from './command';

/**
 * @desc: this super class is the abstract class for all svg generators.
 */
export abstract class AbstractGenerator implements CommandGenerator {

  currentElementsNumber: number;
  currentElement: SVGElement;

  protected constructor(protected mouse: MousePositionService,
                        protected undoRedoService: UndoRedoService) {
    this.currentElementsNumber = 0;
  }

  get xPos(): number {
    return this.mouse.canvasMousePositionX;
  }

  get yPos(): number {
    return this.mouse.canvasMousePositionY;
  }

  abstract createElement(mainColors: [string, string]): void;
  abstract updateElement(currentChildPosition: number, mouseEvent?: MouseEvent): void;
  abstract finishElement(mouseEvent?: MouseEvent): void;

  pushGeneratorCommand(...svgElements: SVGElement[]): void {
    const command: Command = {
      execute(): void {
        svgElements.forEach( (svgElement: SVGElement) =>
          RendererSingleton.renderer.appendChild(RendererSingleton.canvas, svgElement));
      },
      unexecute(): void {
        svgElements.forEach( (svgElement: SVGElement) => {
          RendererSingleton.canvas.removeChild(svgElement);
        });
      },
    };
    this.pushCommand(command);
  }

  pushCommand(command: Command): void {
    this.undoRedoService.pushCommand(command);
  }
}
