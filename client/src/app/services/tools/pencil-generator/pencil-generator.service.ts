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

  set _currentPencilPathNumber(count: number) { this.currentElementsNumber = count; }

  // Initializes the path
  createPath(mouseEvent: MouseEvent, primaryColor: string) {

    this.OFFSET_CANVAS_Y = RendererSingleton.canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = RendererSingleton.canvas.getBoundingClientRect().left;
    const xPos = mouseEvent.pageX - this.OFFSET_CANVAS_X;
    const yPos = mouseEvent.pageY - this.OFFSET_CANVAS_Y;
    // let string addToHTML = generateHTML();

    const path = RendererSingleton.renderer.createElement('path', 'svg');
    const properties: [string, string][] = [];
    properties.push(
      ['id', `pencilPath${this.currentElementsNumber}`],
      ['d', `M ${xPos} ${(yPos)} L ${(xPos)} ${(yPos)}`],
      ['stroke', `${primaryColor}`],
      ['stroke-width', `${this.strokeWidth}`],
      ['stroke-linecap', `round`],
      ['fill', `none`],
    );
    this.drawElement(path, properties);
    this.mouseDown = true;
  }

}
