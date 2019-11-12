import { Injectable } from '@angular/core';
import {AbstractWritingTool} from '../../../data-structures/abstract-writing-tool';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';

@Injectable()
export class PencilGeneratorService extends AbstractWritingTool {

  constructor(protected mouse: MousePositionService,
              protected undoRedoService: UndoRedoService) {
    super(mouse, undoRedoService);
  }

  // Initializes the path
  createElement(primaryColor: string) {
    const path = RendererSingleton.renderer.createElement('path', 'svg');
    const properties: [string, string][] = [];
    properties.push(
      ['id', `pencilPath${this.currentElementsNumber}`],
      ['d', `M ${this.xPos} ${(this.yPos)} L ${(this.xPos)} ${(this.yPos)}`],
      ['stroke', `${primaryColor}`],
      ['stroke-width', `${this.strokeWidth}`],
      ['stroke-linecap', `round`],
      ['fill', `none`],
    );
    this.drawElement(path, properties);
    this.mouseDown = true;
  }
}
