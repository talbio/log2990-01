import { inject, TestBed } from '@angular/core/testing';
import { MousePositionService } from 'src/app/services/mouse-position/mouse-position.service';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';
import { AerosolGeneratorService } from './aerosol-generator.service';

const undoRedoSpy: jasmine.SpyObj<UndoRedoService> =
  jasmine.createSpyObj('UndoRedoService', ['pushCommand']);
const mouseSpy: jasmine.SpyObj<MousePositionService> =
  jasmine.createSpyObj('MousePositionService', ['canvasMousePositionX', 'canvasMousePositionY']);

describe('Service: AerosolGenerator', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AerosolGeneratorService,
      {provide: MousePositionService, useValue: mouseSpy},
      {provide: UndoRedoService, useValue: undoRedoSpy},
    ],
    });
  });

  it('should ...', inject([AerosolGeneratorService], (service: AerosolGeneratorService) => {
    expect(service).toBeTruthy();
  }));
});
