import { inject, TestBed } from '@angular/core/testing';
import { MousePositionService } from 'src/app/services/mouse-position/mouse-position.service';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';
import { AerosolGeneratorService } from './aerosol-generator.service';

const undoRedoSpy: jasmine.SpyObj<UndoRedoService> =
  jasmine.createSpyObj('UndoRedoService', ['pushCommand']);
const mouseSpy: jasmine.SpyObj<MousePositionService> =
  jasmine.createSpyObj('MousePositionService', ['canvasMousePositionX', 'canvasMousePositionY']);

let aerosolService: AerosolGeneratorService;

fdescribe('Service: AerosolGenerator', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AerosolGeneratorService,
      {provide: MousePositionService, useValue: mouseSpy},
      {provide: UndoRedoService, useValue: undoRedoSpy},
    ],
    }).compileComponents().then( () => {
      aerosolService = TestBed.get(AerosolGeneratorService);
    });
  });

  it('should ...', inject([AerosolGeneratorService], (service: AerosolGeneratorService) => {
    expect(service).toBeTruthy();
  }));

  describe('sprayDiameter getter/setter', () => {
    it('should change both the spray diameter and the dot radius with the setter', () => {
      aerosolService._sprayDiameter = 20;
      const initialDiameter: number = aerosolService.sprayDiameter;
      const initialDotRadius: number = aerosolService.dotRadius;
      expect(initialDiameter).toEqual(20);
      expect(initialDotRadius).toEqual(aerosolService.calculateSprayDotRadius(initialDiameter));
      aerosolService._sprayDiameter = 50;
      const newDiameter: number = aerosolService.sprayDiameter;
      const newDotRadius: number = aerosolService.dotRadius;
      expect(newDiameter).toEqual(50);
      expect(newDotRadius).toEqual(aerosolService.calculateSprayDotRadius(newDiameter));
    });
  });

  describe('spray', () => {
    it('should set the interval', () => {
      const initialTimer: number = aerosolService.sprayIntervalTimer;
      aerosolService.spray('fakeColor');
      expect(initialTimer).not.toEqual(aerosolService.sprayIntervalTimer);
      aerosolService.stopSpray();
    });
  });

  describe('stopSpray', () => {
    it('should stop the interval', () => {
      aerosolService.spray('fakeColor');
      const timerValue = aerosolService.sprayIntervalTimer;
      const spy = spyOn(global, 'clearInterval').and.callThrough();
      aerosolService.stopSpray();
      expect(spy).toHaveBeenCalledWith(timerValue);
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
