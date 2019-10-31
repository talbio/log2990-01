import { Injectable } from '@angular/core';
import {Action} from '../../data-structures/command';

@Injectable({
  providedIn: 'root',
})
export class UndoRedoService {

  private readonly undoActions: Action[];
  private redoActions: Action[];

  constructor() {
    this.undoActions = [];
    this.redoActions = [];
  }

  undo(): void {
    console.log(this.undoActions);
    if (this.undoActions.length !== 0) {
      const action: Action = this.undoActions.pop() as Action;
      action.unexecute();
      this.redoActions.push(action);
    }
  }

  redo(): void {
    if (this.redoActions.length !== 0) {
      const action: Action = this.redoActions.pop() as Action;
      action.execute();
      this.undoActions.push(action);
    }
  }

  pushAction(action: Action): void {
    console.log(this.undoActions);
    this.undoActions.push(action);
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
