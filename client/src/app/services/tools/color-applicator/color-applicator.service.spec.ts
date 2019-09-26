/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ColorApplicatorService } from './color-applicator.service';

describe('Service: ColorApplicator', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ColorApplicatorService]
    });
  });

  it('should ...', inject([ColorApplicatorService], (service: ColorApplicatorService) => {
    expect(service).toBeTruthy();
  }));
});
