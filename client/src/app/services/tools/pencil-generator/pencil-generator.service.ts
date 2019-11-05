import { Injectable } from '@angular/core';
import {AbstractWritingTool} from '../../../data-structures/abstract-writing-tool';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';

@Injectable()
export class PencilGeneratorService extends AbstractWritingTool {

  /**
   * attributes of pencil tool :
   */
  private currentPencilPathNumber: number;

  constructor(undoRedoService: UndoRedoService) {
    super(undoRedoService);

    this.currentPencilPathNumber = 0;
  }

  set _strokeWidth(width: number) {
    this.strokeWidth = width;
  }

  get _strokeWidth(): number {
    return this.strokeWidth;
  }

  set _currentPencilPathNumber(count: number) { this.currentPencilPathNumber = count; }

  // Initializes the path
  createPenPath(mouseEvent: MouseEvent, canvas: SVGElement, primaryColor: string) {

    this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
    this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;
    const xPos = mouseEvent.pageX - this.OFFSET_CANVAS_X;
    const yPos = mouseEvent.pageY - this.OFFSET_CANVAS_Y;
    // let string addToHTML = generateHTML();

    const path = RendererSingleton.renderer.createElement('path', 'svg');
    const properties: [string, string][] = [];
    properties.push(
      ['id', `pencilPath${this.currentPencilPathNumber}`],
      ['d', `M ${xPos} ${(yPos)} L ${(xPos)} ${(yPos)}`],
      ['stroke', `${primaryColor}`],
      ['stroke-width', `${this.strokeWidth}`],
      ['stroke-linecap', `round`],
      ['fill', `none`],
    );
    this.drawElement(path, properties);
    this.mouseDown = true;
  }

  /**
   * @desc // Updates the path when the mouse is moving (mousedown)
   */
  updatePenPath(mouseEvent: MouseEvent, currentChildPosition: number) {
    this.updatePath(mouseEvent, currentChildPosition);
  }

  /**
   * @desc Finalizes the path, sets up the next one
   */
  finishPenPath() {
    if (this.mouseDown) {
      this.currentPencilPathNumber += 1;
      this.pushGeneratorCommand(this.currentElement);
      this.mouseDown = false;
    }
  }

  // string GenerateHTML(mouseEvent: MouseEvent, canvas: HTMLElement) {
  //   return `<path id=\'pencilPath${this.currentPencilPathNumber}\'
  //   d=\'M ${(mouseEvent.pageX - this.OFFSET_CANVAS_X)} ${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}
  //   L ${(mouseEvent.pageX - this.OFFSET_CANVAS_X)} ${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
  //   stroke=\'${primaryColor}\' stroke-width=\'${this.strokeWidth}\' stroke-linecap=\'round\' fill=\'none\'></path>`;
  // }
}
