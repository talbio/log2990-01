import { Injectable } from '@angular/core';
import {AbstractWritingTool} from '../../../data-structures/abstract-writing-tool';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';

@Injectable()
export class PencilGeneratorService extends AbstractWritingTool {

  constructor(undoRedoService: UndoRedoService) {
    super(undoRedoService);
    this.currentElementsNumber = 0;
  }

  set _strokeWidth(width: number) {
    this.strokeWidth = width;
  }

  get _strokeWidth(): number {
    return this.strokeWidth;
  }

  // Initializes the path
  createElement(xPosition: number, yPosition: number, primaryColor: string) {

    const path = RendererSingleton.renderer.createElement('path', 'svg');
    const properties: [string, string][] = [];
    properties.push(
      ['id', `pencilPath${this.currentElementsNumber}`],
      ['d', `M ${xPosition} ${(yPosition)} L ${(xPosition)} ${(yPosition)}`],
      ['stroke', `${primaryColor}`],
      ['stroke-width', `${this.strokeWidth}`],
      ['stroke-linecap', `round`],
      ['fill', `none`],
    );
    this.drawElement(path, properties);
    this.mouseDown = true;
  }

}
