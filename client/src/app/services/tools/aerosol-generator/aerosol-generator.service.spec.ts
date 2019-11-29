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
    it('should change both the spray diameter and the dot radius with the setter', (service: AerosolGeneratorService) => {
      service._sprayDiameter = 20;
      const initialDiameter: number = service.sprayDiameter;
      const initialDotRadius: number = service.dotRadius;
      expect(initialDiameter).toEqual(20);
      expect(initialDotRadius).toEqual(service.calculateSprayDotRadius(initialDiameter));
      service._sprayDiameter = 50;
      const newDiameter: number = service.sprayDiameter;
      const newDotRadius: number = service.dotRadius;
      expect(newDiameter).toEqual(50);
      expect(newDotRadius).toEqual(service.calculateSprayDotRadius(newDiameter));
    });
  });

  describe('spray', () => {
    it('should set the interval', (service: AerosolGeneratorService) => {
      const initialTimer: number = service.sprayIntervalTimer;
      service.spray('fakeColor');
      expect(initialTimer).not.toEqual(service.sprayIntervalTimer);
      service.stopSpray();
    });
  });

  describe('stopSpray', () => {
    it('should stop the interval', (service: AerosolGeneratorService) => {
      service.spray('fakeColor');
      const timerValue = service.sprayIntervalTimer;
      const spy = spyOn(global, 'clearInterval').and.callThrough();
      service.stopSpray();
      expect(spy).toHaveBeenCalledWith(timerValue);
    });
  });

  describe('randomPointInRadius', () => {
    it('should return a random point within the spray radius of the mouse position', (service: AerosolGeneratorService) => {
      // TODO
    });
  });

  describe('randomLength', () => {
    it('should return a random number between 0 and the spray radius', (service: AerosolGeneratorService) => {
      // TODO
    });
  });

  describe('randomAngle', () => {
    it('should return a random number between 0 and 2*PI', (service: AerosolGeneratorService) => {
      // TODO
    });
  });

  describe('generateDot', () => {
    it('should generate a dot with the correct properties', (service: AerosolGeneratorService) => {
      // TODO
    });
  });
});
