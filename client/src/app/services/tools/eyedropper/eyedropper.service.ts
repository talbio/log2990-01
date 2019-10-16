import { Injectable, Renderer2 } from '@angular/core';
import { MousePositionService } from './../../mouse-position/mouse-position.service';

@Injectable()
export class EyedropperService {
  private renderer: Renderer2;

  constructor(private mousePosition: MousePositionService) {
    // nothing to do here
  }
  getColorOnPixel(canvas: SVGElement): string {
    const canvElem = this.renderer.createElement('canvas');
    const context = canvElem.getContext('2d');
    const img = new Image();
    img.src = `url('#canvas')`;
    context.drawImage(img, 0, 0);
    const pixData = context.getImageData(this.mousePosition._pageMousePositionX, this.mousePosition._pageMousePositionY, 1, 1);
    const pixColor = `RGBA(${pixData[0]},${pixData[1]},${pixData[2]},${pixData[3]})`;
    return pixColor;
  }
  set _renderer(rend: Renderer2) {
    this.renderer = rend;
  }
}
