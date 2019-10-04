import { inject, TestBed } from '@angular/core/testing';
import { ObjectSelectorService } from './object-selector.service';

describe('Service: ShapeGenerator', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ObjectSelectorService],
    });
  });

  it('should ...', inject([ObjectSelectorService], (service: ObjectSelectorService) => {
    expect(service).toBeTruthy();
  }));
});
