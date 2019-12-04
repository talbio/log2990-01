import { Component, Renderer2 } from '@angular/core';
import {BrushGeneratorService} from '../../../../../services/tools/brush-generator/brush-generator.service';

const DEFAULT_HEIGHT = '20';
const DEFAULT_WIDTH = '20';
@Component({
  selector: 'app-brush-tools',
  templateUrl: './brush-tools.component.html',
  styleUrls: ['./../tool-attributes.component.scss'],
})
export class BrushToolsComponent {
  protected readonly NUMBER_OF_TEXTURES = 6;
  constructor(protected brushGenerator: BrushGeneratorService,
              private renderer: Renderer2) { }

  previewRect(index: number): void {
    let previewSvg: SVGElement;
    for (let i = 1; i <= index; i++) {
      // By reselecting it, we empty its content everytime
      const defs: SVGElement = this.renderer.selectRootElement(`#definitions`, true);
      previewSvg = this.renderer.selectRootElement('#brushPreview');
      const defsCopy = this.renderer.createElement('defs', 'svg');
      defsCopy.innerHTML = defs.innerHTML;
      this.renderer.appendChild(previewSvg, defsCopy);
      previewSvg.innerHTML +=
        `<rect x="0" y="0" width="${DEFAULT_WIDTH}" height="${DEFAULT_HEIGHT}" stroke="black" fill="url(#brushPattern${i})">
        </rect>`;
      const preview: string = (new XMLSerializer()).serializeToString(previewSvg);
      const previewImg = this.renderer.selectRootElement(`#texturePreview${i}`);
      this.renderer.setAttribute(previewImg, 'src', `data:image/svg+xml;base64,${window.btoa(preview)}`);
    }
    previewSvg = this.renderer.selectRootElement('#brushPreview');
  }
}
