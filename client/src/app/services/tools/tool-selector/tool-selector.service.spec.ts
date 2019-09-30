/* tslint:disable:no-unused-variable */

import { inject, TestBed } from '@angular/core/testing';
import { ToolSelectorService } from './tool-selector.service';

describe('Service: ButtonManager', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToolSelectorService],
    });
  });

  it('should ...', inject([ToolSelectorService], (service: ToolSelectorService) => {
    expect(service).toBeTruthy();
  }));
});
