/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PolygonGeneratorService } from './polygon-generator.service';

describe('Service: PolygonGenerator', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PolygonGeneratorService]
    });
  });

  it('should ...', inject([PolygonGeneratorService], (service: PolygonGeneratorService) => {
    expect(service).toBeTruthy();
  }));
});
