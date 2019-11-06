import {RendererSingleton} from '../services/renderer-singleton';
import {UndoRedoService} from '../services/undo-redo/undo-redo.service';
import {Command, CommandGenerator} from './command';

/**
 * @desc: this super class is the abstract class for all svg generators.
 */
export abstract class AbstractGenerator implements CommandGenerator {

  protected currentElement: SVGElement;
  protected currentElementsNumber: number;

  protected constructor(protected undoRedoService: UndoRedoService) {
    this.currentElementsNumber = 0;
  }

  pushGeneratorCommand(...svgElements: SVGElement[]): void {
    const action: Command = {
      execute(): void {
        svgElements.forEach( (svgElement: SVGElement) =>
          RendererSingleton.renderer.appendChild(RendererSingleton.getCanvas(), svgElement));
      },
      unexecute(): void {
        svgElements.forEach( (svgElement: SVGElement) =>
          RendererSingleton.renderer.removeChild(RendererSingleton.getCanvas(), svgElement));
      },
    };
    this.pushCommand(action);
  }

  pushCommand(action: Command): void {
    this.undoRedoService.pushCommand(action);
  }
}
