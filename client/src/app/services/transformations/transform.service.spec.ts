
import { inject, TestBed } from '@angular/core/testing';
import { TransformService } from './transform.service';

describe('Service: Transformation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransformService],
    });
  });

  it('should ...', inject([TransformService], (service: TransformService) => {
    expect(service).toBeTruthy();
  }));

  it('should multiply adequatly two matrices', inject([TransformService], (service: TransformService) => {
    const mat1 = [[1, 4, 7], [2, 5, 8], [3, 6, 9]];
    const mat2 = [[10, 13, 16], [11, 14, 17], [12, 15, 18]];
    const expectedMatrix = [[84, 201, 318], [90, 216, 342], [96, 231, 366]];
    expect(service.multiplyMatrices(mat1, mat2)).toEqual(expectedMatrix);
  }));
});
