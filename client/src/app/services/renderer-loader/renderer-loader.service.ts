import {Injectable, Renderer2} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RendererLoaderService {

  private renderer: Renderer2;

  constructor() {}

  set _renderer(renderer: Renderer2) {
    this.renderer = renderer;
  }

  get _renderer(): Renderer2 {
    return this.renderer;
  }
}
