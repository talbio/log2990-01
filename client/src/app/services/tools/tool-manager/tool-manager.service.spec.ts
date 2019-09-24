/* tslint:disable:no-unused-variable */

import { async, inject, TestBed } from '@angular/core/testing';
import { ToolManagerService } from './tool-manager.service';

describe('Service: ToolManager', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToolManagerService],
    });
  });

  it('should ...', inject([ToolManagerService], (service: ToolManagerService) => {
    expect(service).toBeTruthy();
  }));
});
