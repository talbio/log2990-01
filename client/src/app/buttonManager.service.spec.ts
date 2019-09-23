/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ButtonManagerService } from './buttonManager.service';

describe('Service: ButtonManager', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ButtonManagerService]
    });
  });

  it('should ...', inject([ButtonManagerService], (service: ButtonManagerService) => {
    expect(service).toBeTruthy();
  }));
});
