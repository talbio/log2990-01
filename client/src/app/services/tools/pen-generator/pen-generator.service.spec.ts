import { TestBed } from '@angular/core/testing';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { PenGeneratorService } from './pen-generator.service';

fdescribe('PenGeneratorService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [PenGeneratorService, MousePositionService],
    }));
    it('should be created', () => {
        const penService: PenGeneratorService = TestBed.get(PenGeneratorService);
        expect(penService).toBeTruthy();
    });
    it('should calculate speed accurately', () => {
        const penService: PenGeneratorService = TestBed.get(PenGeneratorService);
        penService.positionX = 0;
        penService.positionY = 0;
        penService.time = 0;
        const currentDotPositionX = 5;
        const currentDotPositionY = 5;
        const currentTime = 1;
        expect(penService.getSpeed(currentTime, currentDotPositionX, currentDotPositionY)).toEqual(7.0710678118654755);

    });
});
