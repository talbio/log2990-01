/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AerosolGeneratorService } from './aerosol-generator.service';

describe('Service: AerosolGenerator', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AerosolGeneratorService]
    });
  });

  it('should ...', inject([AerosolGeneratorService], (service: AerosolGeneratorService) => {
    expect(service).toBeTruthy();
  }));
});
