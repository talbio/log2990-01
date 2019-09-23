/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PenModeService } from './pen-mode.service';

describe('Service: PenMode', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PenModeService]
    });
  });

  it('should ...', inject([PenModeService], (service: PenModeService) => {
    expect(service).toBeTruthy();
  }));
});
