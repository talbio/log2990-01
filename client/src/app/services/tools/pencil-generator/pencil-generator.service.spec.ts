/* tslint:disable:no-unused-variable */

import { inject, TestBed } from '@angular/core/testing';
import { PencilGeneratorService } from './pencil-generator.service';

describe('Service: PenMode', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PencilGeneratorService],
    });
  });

  it('should ...', inject([PencilGeneratorService], (service: PencilGeneratorService) => {
    expect(service).toBeTruthy();
  }));

  it('updatePenPath should return 0 if !mouseDown', () => {
    let pencil: PencilGeneratorService;
    pencil.createPenPath();
    pencil._mouseDown(false);
    // Testability needs attributes
    pencil.updatePenPath();
    expect(currentPath).toBe(undefined);
  });
});
