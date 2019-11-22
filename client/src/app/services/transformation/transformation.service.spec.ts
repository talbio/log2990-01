
import { inject, TestBed } from '@angular/core/testing';
import { TransformationService } from './transformation.service';

describe('Service: Transformation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransformationService]
    });
  });

  it('should ...', inject([TransformationService], (service: TransformationService) => {
    expect(service).toBeTruthy();
  }));
});
