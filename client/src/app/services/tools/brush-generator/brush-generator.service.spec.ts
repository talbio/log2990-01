/* tslint:disable:no-unused-variable */

import { inject, TestBed } from '@angular/core/testing';
import { BrushGeneratorService } from './brush-generator.service';

describe('Service: BrushGenerator', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrushGeneratorService],
    });
  });

  it('should ...', inject([BrushGeneratorService], (service: BrushGeneratorService) => {
    expect(service).toBeTruthy();
  }));
});
