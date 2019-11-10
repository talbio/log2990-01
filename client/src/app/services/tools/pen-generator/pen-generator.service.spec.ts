import { TestBed } from '@angular/core/testing';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { PenGeneratorService } from './pen-generator.service';

describe('PenGeneratorService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [PenGeneratorService, MousePositionService],
    }));
    it('should be created', () => {
        const penService: PenGeneratorService = TestBed.get(PenGeneratorService);
        expect(penService).toBeTruthy();
    });
    it('(getSpeed) should calculate speed accurately', () => {
        const penService: PenGeneratorService = TestBed.get(PenGeneratorService);
        penService.positionX = 0;
        penService.positionY = 0;
        penService.time = 0;
        const currentDotPositionX = 5;
        const currentDotPositionY = 5;
        const currentTime = 1;
        expect(penService.getSpeed(currentTime, currentDotPositionX, currentDotPositionY)).toEqual(Math.sqrt(50));
    });

    it('(adjustSpeed) should return average of last speeds', () => {
        const penService: PenGeneratorService = TestBed.get(PenGeneratorService);
        penService.speedArray = [0, 1, 2, 3, 4];
        const newSpeed = 5;
        expect(penService.adjustSpeed(newSpeed)).toEqual(2.5);
        // if array is full, FIFO and new value is added
        penService.speedArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
        expect(penService.adjustSpeed(newSpeed)).toEqual(5);
    });

    it('(updateStrokeWidth) should not allow values lower than strokeWithMinimum or higher than strokeWidthMaximum', () => {
        const penService: PenGeneratorService = TestBed.get(PenGeneratorService);
        penService.strokeWidthMinimum = 5;
        penService.strokeWidthMaximum = 20;
        penService.updateStrokeWidth(10000000);
        expect(penService.strokeWidth).toEqual(5);
        penService.updateStrokeWidth(0.00001);
        expect(penService.strokeWidth).toEqual(20);
    });
});
