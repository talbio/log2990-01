/* tslint:disable:no-unused-variable */

import { inject, TestBed } from '@angular/core/testing';
import { GridTogglerService } from './grid-toggler.service';

describe('Service: GridToggler', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GridTogglerService],
    });
  });

  it('should ...', inject([GridTogglerService], (service: GridTogglerService) => {
    expect(service).toBeTruthy();
  }));
});
