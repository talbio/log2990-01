/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RectangleGeneratorService } from './rectangle-generator.service';

describe('Service: ShapeGenerator', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RectangleGeneratorService]
    });
  });

  it('should ...', inject([RectangleGeneratorService], (service: RectangleGeneratorService) => {
    expect(service).toBeTruthy();
  }));
});
