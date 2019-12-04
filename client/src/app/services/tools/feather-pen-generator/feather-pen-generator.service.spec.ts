import { TestBed } from '@angular/core/testing';
import { BOTTOM_AFTER, BOTTOM_BEFORE, TOP_AFTER, TOP_BEFORE } from 'src/app/data-structures/constants';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { FeatherPenGeneratorService } from './feather-pen-generator.service';

describe('featherPenGeneratorService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [FeatherPenGeneratorService, MousePositionService],
  }));
  describe('rotateFeather()', () => {
    it('should be able to rotate infinitely in both ways', () => {
      const feather: FeatherPenGeneratorService = TestBed.get(FeatherPenGeneratorService);
      const initialAngle = feather.angle;
      const ceilingAngle = 180;
      const floorAngle = 0;
      const wheelEventUp = new WheelEvent('mousewheel', {
        deltaY: -1,
      });

      feather.rotateFeather(wheelEventUp);
      expect(feather.angle).toEqual(initialAngle + feather.rotationStep);

      const wheelEventDown = new WheelEvent('mousewheel', {
        deltaY: 1,
      });
      feather.rotateFeather(wheelEventDown);
      expect(feather.angle).toEqual(initialAngle);

      feather.angle = ceilingAngle;
      feather.rotateFeather(wheelEventUp);
      expect(feather.angle).toEqual(15);

      feather.angle = floorAngle;
      feather.rotateFeather(wheelEventDown);
      expect(feather.angle).toEqual(165);
    });
  });

  describe('getProperties()', () => {
    it('should get properly the parameters of a polygon', () => {
      const feather: FeatherPenGeneratorService = TestBed.get(FeatherPenGeneratorService);
      feather.currentElementsNumber = 2;
      feather.polygonPoints[TOP_BEFORE] = [100, 75];
      feather.polygonPoints[BOTTOM_BEFORE] = [100, 50];
      feather.polygonPoints[TOP_AFTER] = [110, 75];
      feather.polygonPoints[BOTTOM_AFTER] = [110, 50];
      feather.color = 'black';
      const properties = feather.getProperties();
      expect(properties[0]).toEqual(['id', 'featherPenPath2']);
      expect(properties[1]).toEqual(['points', '100,75 100,50 110,50 110,75 ']);
      expect(properties[2]).toEqual(['stroke', 'black']);
      expect(properties[4]).toEqual(['fill', 'black']);
    });
  });
});
