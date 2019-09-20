/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ShapeGeneratorService } from './shapeGenerator.service';

describe('Service: ShapeGenerator', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShapeGeneratorService]
    });
  });

  it('should ...', inject([ShapeGeneratorService], (service: ShapeGeneratorService) => {
    expect(service).toBeTruthy();
  }));
});
