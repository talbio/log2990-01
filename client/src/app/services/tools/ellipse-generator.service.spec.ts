/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EllipseGeneratorService } from './ellipse-generator.service';

describe('Service: EllipseGenerator', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EllipseGeneratorService]
    });
  });

  it('should ...', inject([EllipseGeneratorService], (service: EllipseGeneratorService) => {
    expect(service).toBeTruthy();
  }));
});
