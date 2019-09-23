/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ModeManagerService } from './mode-manager.service';

describe('Service: ModeManager', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModeManagerService]
    });
  });

  it('should ...', inject([ModeManagerService], (service: ModeManagerService) => {
    expect(service).toBeTruthy();
  }));
});
