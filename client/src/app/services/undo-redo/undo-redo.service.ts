import { Injectable } from '@angular/core';
import {Command} from '../../data-structures/command';

@Injectable({
  providedIn: 'root',
})
export class UndoRedoService {

  private readonly undoCommands: Command[];
  private redoCommands: Command[];

  constructor() {
    this.undoCommands = [];
    this.redoCommands = [];
  }

  undo(): void {
    if (this.undoCommands.length !== 0) {
      const command: Command = this.undoCommands.pop() as Command;
      command.unexecute();
      this.redoCommands.push(command);
    }
  }

  redo(): void {
    if (this.redoCommands.length !== 0) {
      const command: Command = this.redoCommands.pop() as Command;
      command.execute();
      this.undoCommands.push(command);
    }
  }

  canUndo(): boolean {
    return this.undoCommands.length !== 0;
  }

  canRedo(): boolean {
    return this.redoCommands.length !== 0;
  }

  pushCommand(command: Command): void {
    if (this.redoCommands.length !== 0) {
      this.redoCommands = [];
    }
    this.undoCommands.push(command);
  }

  /**
   * 1 : créer rectangle
   * 2 : push cette action dans undo
   * 3 : l'utilisateur appuie sur annuler -> suppression du rectangle :
   *       pop de undo le rectangle, appeler unexecute, push dans redo.
   * 4 : l'utilisateur appuie sur refaire -> recréation du rectangle :
   *       pop de redo le rectangle, appeler execute, push dans undo.
   */
}
