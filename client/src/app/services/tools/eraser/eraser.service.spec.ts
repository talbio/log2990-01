import { TestBed } from '@angular/core/testing';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { EraserService } from './eraser.service';

describe('EraserService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [EraserService, MousePositionService],
    }));
    it('should be created', () => {
        const eraserService: EraserService = TestBed.get(EraserService);
        expect(eraserService).toBeTruthy();
    });
    describe('intersects', () => {
        it('should return true if drawing and eraser touch, false otherwise ', () => {
            const eraserService: EraserService = TestBed.get(EraserService);
            const drawingZone = {
                left: 10,
                top: 10,
                right: 20,
                bottom: 20,
            };
            eraserService.eraseZone = {
                left: 0,
                top: 0,
                right: 9,
                bottom: 9,
            };
            eraserService.OFFSET_CANVAS_X = 0;
            eraserService.OFFSET_CANVAS_Y = 0;
            expect(eraserService.intersects(drawingZone as DOMRect)).toBeFalsy();

            eraserService.eraseZone = {
                left: 0,
                top: 0,
                right: 10,
                bottom: 10,
            };
            expect(eraserService.intersects(drawingZone as DOMRect)).toBeTruthy();
        });
    });

    describe('isCloseToIntersecting', () => {
        it('should return true if drawing and eraser are close to intersecting (< ERASER_WARNING_DISTANCE), false otherwise ', () => {
            const eraserService: EraserService = TestBed.get(EraserService);
            const drawingZone = {
                left: 200,
                top: 200,
                right: 250,
                bottom: 250,
            };
            eraserService.eraseZone = {
                left: 0,
                top: 0,
                right: 10,
                bottom: 10,
            };
            eraserService.OFFSET_CANVAS_X = 0;
            eraserService.OFFSET_CANVAS_Y = 0;
            expect(eraserService.isCloseToIntersecting(drawingZone as DOMRect)).toBeFalsy();

            eraserService.eraseZone = {
                left: 180,
                top: 180,
                right: 190,
                bottom: 190,
            };
            expect(eraserService.isCloseToIntersecting(drawingZone as DOMRect)).toBeTruthy();

        });
    });
});
