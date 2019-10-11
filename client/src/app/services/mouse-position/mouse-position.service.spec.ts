/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MousePositionService } from './mouse-position.service';

describe('Service: MousePosition', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MousePositionService]
    });
  });

  it('should ...', inject([MousePositionService], (service: MousePositionService) => {
    expect(service).toBeTruthy();
  }));
});
