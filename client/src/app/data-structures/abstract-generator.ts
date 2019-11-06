import {RendererSingleton} from '../services/renderer-singleton';
import {UndoRedoService} from '../services/undo-redo/undo-redo.service';
import {Command, CommandGenerator} from './command';

/**
 * @desc: this super class is the abstract class for all svg generators.
 */
export abstract class AbstractGenerator implements CommandGenerator {

  currentElementsNumber: number;
  protected currentElement: SVGElement;

  protected constructor(protected undoRedoService: UndoRedoService) {
    this.currentElementsNumber = 0;
  }

  pushGeneratorCommand(...svgElements: SVGElement[]): void {
    const action: Command = {
      execute(): void {
        svgElements.forEach( (svgElement: SVGElement) =>
          RendererSingleton.renderer.appendChild(RendererSingleton.canvas, svgElement));
      },
      unexecute(): void {
        svgElements.forEach( (svgElement: SVGElement) =>
          RendererSingleton.renderer.removeChild(RendererSingleton.canvas, svgElement));
      },
    };
    this.pushCommand(action);
  }

  pushCommand(action: Command): void {
    this.undoRedoService.pushCommand(action);
  }
}
