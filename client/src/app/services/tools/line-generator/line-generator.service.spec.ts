/* tslint:disable:no-unused-variable */

import { inject, TestBed } from '@angular/core/testing';
import { LineGeneratorService } from './line-generator.service';

describe('Service: LineGenerator', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LineGeneratorService],
    });
  });

  it('should ...', inject([LineGeneratorService], (service: LineGeneratorService) => {
    expect(service).toBeTruthy();
  }));
});
