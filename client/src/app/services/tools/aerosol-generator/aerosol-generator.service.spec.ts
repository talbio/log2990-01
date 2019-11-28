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

  describe('sprayDiameter getter/setter', () => {
    it('should change both the spray diameter and the dot radius with the setter', () => {
      // TODO
    });
  });

  describe('spray', () => {
    it('should set the interval', () => {
      // TODO
    });
  });

  describe('stopSpray', () => {
    it('should stop the interval', () => {
      // TODO
    });
  });

  describe('randomPointInRadius', () => {
    it('should return a random point within the spray radius of the mouse position', () => {
      // TODO
    });
  });

  describe('randomLength', () => {
    it('should return a random number between 0 and the spray radius', () => {
      // TODO
    });
  });

  describe('randomAngle', () => {
    it('should return a random number between 0 and 2*PI', () => {
      // TODO
    });
  });

  describe('generateDot', () => {
    it('should generate a dot with the correct properties', () => {
      // TODO
    });
  });
});
