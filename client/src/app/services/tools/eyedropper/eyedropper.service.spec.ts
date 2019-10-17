/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EyedropperService } from './eyedropper.service';

describe('Service: Eyedropper', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EyedropperService]
    });
  });

  it('should ...', inject([EyedropperService], (service: EyedropperService) => {
    expect(service).toBeTruthy();
  }));
});
