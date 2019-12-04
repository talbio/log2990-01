import { TestBed } from '@angular/core/testing';

import { RotateService } from './rotate.service';

describe('RotateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RotateService = TestBed.get(RotateService);
    expect(service).toBeTruthy();
  });
});
