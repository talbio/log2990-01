import { TestBed } from '@angular/core/testing';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { EraserService } from './eraser.service';

fdescribe('EraserService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [EraserService, MousePositionService],
    }));
    it('should be created', () => {
        const service: EraserService = TestBed.get(EraserService);
        expect(service).toBeTruthy();
    });
    // it('should be possible to tell if the eraser is touching a drawing', () => {
    //     const service: EraserService = TestBed.get(EraserService);
    //     expect(service.intersects( drawing )).toBeTruthy();
    // });
});
