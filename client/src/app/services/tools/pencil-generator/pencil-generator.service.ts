import { Injectable } from '@angular/core';
import {AbstractWritingTool} from '../../../data-structures/abstract-writing-tool';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';
import { MousePositionService } from './../../mouse-position/mouse-position.service';

@Injectable()
export class PencilGeneratorService extends AbstractWritingTool {

  /**
   * attributes of pencil tool :
   */
  private currentPencilPathNumber: number;

  constructor(private mousePosition: MousePositionService,
              undoRedoService: UndoRedoService) {
    super(mousePosition, undoRedoService);
    this.currentPencilPathNumber = 0;
  }

  set _strokeWidth(width: number) {
    this.strokeWidth = width;
  }

  get _strokeWidth(): number {
    return this.strokeWidth;
  }

  // Initializes the path
  createPenPath(primaryColor: string) {
    const path = RendererSingleton.renderer.createElement('path', 'svg');
    const properties: [string, string][] = [];
    properties.push(
      ['id', `pencilPath${this.currentPencilPathNumber}`],
      ['d', `M ${this.xPos} ${(this.yPos)}
        L ${(this.xPos)} ${(this.yPos)}`],
      ['stroke', `${primaryColor}`],
      ['stroke-width', `${this.strokeWidth}`],
      ['stroke-linecap', `round`],
      ['fill', `none`],
    );
    this.drawElement(path, properties);
    this.mouseDown = true;
  }
}
