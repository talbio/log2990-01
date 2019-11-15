import { Injectable } from '@angular/core';
import { AbstractWritingTool } from 'src/app/data-structures/abstract-writing-tool';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { UndoRedoService } from '../../undo-redo/undo-redo.service';

@Injectable()
export class AerosolGeneratorService extends AbstractWritingTool {

  sprayRadius: number;

  constructor(protected undoRedoService: UndoRedoService,
              protected mouse: MousePositionService) {
      super(mouse, undoRedoService);
      this.sprayRadius = 5;
     }

  createElement(mainColors: [string, string]): void {
    this.mouseDown = true;
  }

  spray(): void {
    console.log('spraying');
  }

}
