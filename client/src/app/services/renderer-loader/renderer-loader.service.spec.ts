import { TestBed } from '@angular/core/testing';

import { RendererLoaderService } from './renderer-loader.service';

describe('RendererLoaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RendererLoaderService = TestBed.get(RendererLoaderService);
    expect(service).toBeTruthy();
  });
});
