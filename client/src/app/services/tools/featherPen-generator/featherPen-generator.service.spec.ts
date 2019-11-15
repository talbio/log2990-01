import { TestBed } from '@angular/core/testing';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { FeatherPenGeneratorService } from './featherPen-generator.service';

describe('PenGeneratorService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [FeatherPenGeneratorService, MousePositionService],
    }));
});
