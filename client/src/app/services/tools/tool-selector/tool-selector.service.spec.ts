/* tslint:disable:no-unused-variable */

import { inject, TestBed } from '@angular/core/testing';
import { Tools } from 'src/app/data-structures/Tools';
import { ToolSelectorService } from './tool-selector.service';

describe('Service: ToolSelectorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToolSelectorService],
    });
  });

  it('#getActiveTool should return Tools.Brush', inject([ToolSelectorService], (service: ToolSelectorService) => {
    service._activeTool = Tools.Brush;
    expect(service._activeTool).toBe(Tools.Brush);
  }));
});
