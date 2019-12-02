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
    it('should change both the spray diameter and the dot radius with the setter',
        inject([AerosolGeneratorService], (service: AerosolGeneratorService) => {
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
    }));
  });

  describe('spray', () => {
    it('should set the interval', inject([AerosolGeneratorService],
          (service: AerosolGeneratorService) => {
      const initialTimer: number = service.sprayIntervalTimer;
      service.spray('fakeColor');
      expect(initialTimer).not.toEqual(service.sprayIntervalTimer);
      service.stopSpray();
    }));
  });

  describe('stopSpray', () => {
    it('should stop the interval', inject([AerosolGeneratorService],
      (service: AerosolGeneratorService) => {
      service.spray('fakeColor');
      const timerValue = service.sprayIntervalTimer;
      const spy = spyOn(global, 'clearInterval').and.callThrough();
      service.stopSpray();
      expect(spy).toHaveBeenCalledWith(timerValue);
    }));
  });

  describe('randomPointInRadius', () => {
    it('should return a random point within the spray radius of the mouse position', inject([AerosolGeneratorService],
      (service: AerosolGeneratorService) => {
      // We force different math random values to show that the result will vary with the seed
      const mathSpy = spyOn(Math, 'random').and.returnValue(1);
      // We spy on the service's x and y pos to make sure they are positive (as they should be)
      spyOnProperty(service, 'xPos').and.returnValue(10);
      spyOnProperty(service, 'yPos').and.returnValue(10);
      const radius = service.sprayDiameter / 2;
      const xPos = service.xPos;
      const yPos = service.yPos;
      const firstRandomPoint: number[] = service.randomPointInRadius();
      // the first value is the position in the x axis
      expect(firstRandomPoint[0]).toBeLessThanOrEqual(radius + xPos);
      expect(firstRandomPoint[0]).toBeGreaterThanOrEqual((radius * -1) + xPos);
      expect(firstRandomPoint[1]).toBeLessThanOrEqual(radius + yPos);
      expect(firstRandomPoint[1]).toBeGreaterThanOrEqual((radius * -1) + yPos);
      // the second value is the position in the y axis
      mathSpy.and.returnValue(0.5);
      const secondRandomPoint: number[] = service.randomPointInRadius();
      expect(secondRandomPoint[0]).toBeLessThanOrEqual(radius + xPos);
      expect(secondRandomPoint[0]).toBeGreaterThanOrEqual((radius * -1) + xPos);
      expect(secondRandomPoint[1]).toBeLessThanOrEqual(radius + yPos);
      expect(secondRandomPoint[1]).toBeGreaterThanOrEqual((radius * -1) + yPos);

      expect(secondRandomPoint[0]).not.toEqual(firstRandomPoint[0]);
      expect(secondRandomPoint[1]).not.toEqual(firstRandomPoint[1]);
    }));
  });

  describe('randomLength', () => {
    it('should return a random number between 0 and the spray radius', inject([AerosolGeneratorService],
      (service: AerosolGeneratorService) => {
      // We force different math random values to show that the result will vary with the seed
      const mathSpy = spyOn(Math, 'random').and.returnValue(1);
      const radius = service.sprayDiameter / 2;
      const firstRandomLength = service.randomLength();
      expect(firstRandomLength).toBeLessThanOrEqual(radius);
      expect(firstRandomLength).toBeGreaterThanOrEqual(0);
      mathSpy.and.returnValue(0.5);
      const secondRandomLength = service.randomLength();
      expect(secondRandomLength).toBeLessThanOrEqual(radius);
      expect(secondRandomLength).toBeGreaterThanOrEqual(0);
      expect(firstRandomLength).not.toEqual(secondRandomLength);
    }));
  });

  describe('randomAngle', () => {
    it('should return a random number between 0 and 2*PI', inject([AerosolGeneratorService],
       (service: AerosolGeneratorService) => {
      // We force different math random values to show that the result will vary with the seed
      const mathSpy = spyOn(Math, 'random').and.returnValue(1);
      const firstRandomAngle = service.randomAngle();
      expect(firstRandomAngle).toBeLessThanOrEqual(2 * Math.PI);
      expect(firstRandomAngle).toBeGreaterThanOrEqual(0);
      mathSpy.and.returnValue(0.5);
      const secondRandomAngle = service.randomAngle();
      expect(secondRandomAngle).toBeLessThanOrEqual(2 * Math.PI);
      expect(secondRandomAngle).toBeGreaterThanOrEqual(0);
      expect(firstRandomAngle).not.toEqual(secondRandomAngle);
    }));
  });
});
