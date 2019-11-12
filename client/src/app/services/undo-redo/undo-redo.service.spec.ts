import {async, TestBed} from '@angular/core/testing';
import {Command} from '../../data-structures/command';
import { UndoRedoService } from './undo-redo.service';

describe('UndoRedoService', () => {

  const FAKE_COMMAND_1: Command =  {
    execute(): void {
      return;
    },
    unexecute(): void {
      return;
    },
  };

  const FAKE_COMMAND_2: Command = {
    execute(): void {
      return;
    },
    unexecute(): void {
      return;
    },
  };

  const FAKE_COMMAND_3: Command = {
    execute(): void {
      return;
    },
    unexecute(): void {
      return;
    },
  };

  let undoRedoService: UndoRedoService;

  beforeEach(async(() =>
    TestBed.configureTestingModule({
    }).compileComponents().then( () => {
      undoRedoService = TestBed.get(UndoRedoService);
    })));

  it('should be created', () => {
    expect(undoRedoService).toBeTruthy();
  });

  describe('canRedo', () => {
    it('should return false if there is no redo commands to redo', () => {
      undoRedoService.pushCommand(FAKE_COMMAND_1);
      expect(undoRedoService.canRedo()).toBe(false);
    });

    it('should return true if there is redo commands to redo', () => {
      undoRedoService.pushCommand(FAKE_COMMAND_1);
      undoRedoService.undo();
      expect(undoRedoService.canRedo()).toBe(true);
    });
  });

  describe('canUndo', () => {
    it('should return false if there is no undo commands to undo', () => {
      undoRedoService.pushCommand(FAKE_COMMAND_1);
      undoRedoService.undo();
      expect(undoRedoService.canUndo()).toBe(false);
    });

    it('should return true if there is redo commands to redo', () => {
      undoRedoService.pushCommand(FAKE_COMMAND_1);
      expect(undoRedoService.canUndo()).toBe(true);
    });
  });

  describe('pushCommand', () => {
    it('should push a command in the undoCommands list', () => {
      undoRedoService.pushCommand(FAKE_COMMAND_1);
      expect(undoRedoService.canUndo()).toBe(true);
    });

    it('should delete all redo commands if there is a new command being pushed', () => {
      undoRedoService.pushCommand(FAKE_COMMAND_1);
      undoRedoService.pushCommand(FAKE_COMMAND_2);
      undoRedoService.undo();
      undoRedoService.undo();
      expect(undoRedoService.canRedo()).toBe(true);
      undoRedoService.pushCommand(FAKE_COMMAND_3);
      expect(undoRedoService.canRedo()).toBe(false);
    });
  });

  describe('undo', () => {
    it('should pop the last command from the undoCommands list and call its unexecute method', () => {
      undoRedoService.pushCommand(FAKE_COMMAND_1);
      spyOn(FAKE_COMMAND_1, 'unexecute');
      undoRedoService.undo();
      expect(FAKE_COMMAND_1.unexecute).toHaveBeenCalled();
    });
  });

  describe('redo', () => {
    it('should pop the last command from the redoCommands list and call its execute method', () => {
      undoRedoService.pushCommand(FAKE_COMMAND_1);
      spyOn(FAKE_COMMAND_1, 'execute');
      undoRedoService.undo();
      undoRedoService.redo();
      expect(FAKE_COMMAND_1.execute).toHaveBeenCalled();
    });
  });
});
