import { Injectable, Renderer2 } from '@angular/core';
import { LineGeneratorService } from './../line-generator/line-generator.service';

@Injectable()
export class ColorApplicatorService {
  private renderer: Renderer2;
  constructor(private lineGenerator: LineGeneratorService) {}
  changePrimaryColor(targetObject: SVGElement, newColor: string) {
    switch (targetObject.nodeName) {

      case 'rect':
        // Rectangle
        targetObject.setAttribute('fill', newColor);
        break;
      case 'path':
        // Check specific type of path
        if (('' + targetObject.getAttribute('id')).startsWith('pencil')) {
          // Pencil
          targetObject.setAttribute('stroke', newColor);
        } else if (('' + targetObject.getAttribute('id')).startsWith('brush')) {
          // PaintBrush
          // targetObject.setAttribute('stroke', newColor);
          // attribute stroke for brush paths are structed as follows: url(#brushPatternX), therefore the id is in substring 5 to 18
          const pattern = document.getElementById((targetObject.getAttribute('stroke') as string).substring(5, 18));
          if (pattern != null) {
            for (const child of [].slice.call(pattern.children)) {
              if (child.hasAttribute('fill')) {
                child.setAttribute('fill', newColor);
              }
            }
          }
        } else {
          alert('Object id is \'' + targetObject.getAttribute('id') + '\' and this case is not treated!');
        }
        break;
      case 'ellipse':
        targetObject.setAttribute('fill', newColor);
        break;
      case 'polygon':
        targetObject.setAttribute('fill', newColor);
        break;
      case 'polyline':
        targetObject.setAttribute('stroke', newColor);
        // find the markers
        const defs = this.renderer.selectRootElement('#definitions', true);
        const markers = this.lineGenerator.findMarkerFromPolyline(targetObject, defs);
        // change color of the circles in the markers
        markers.children[0].setAttribute('fill', newColor);
        break;
      case 'svg':
        // Canvas
        break;
      default:
        alert('Object is of type ' + targetObject.nodeName + ' and this case is not treated!');
        break;
    }

  }

  changeSecondaryColor(targetObject: HTMLElement, newColor: string) {
    switch (targetObject.nodeName) {
      case 'rect':
        // Rectangle
        targetObject.setAttribute('stroke', newColor);
        break;
      case 'path':
        // Paths should only be able to change the primary colorSelected, unless they are a paintbrush texture
        if ((targetObject.getAttribute('id') as string).startsWith('brush')) {
          const pattern = document.getElementById((targetObject.getAttribute('stroke') as string).substring(5, 18));
          if (pattern != null) {
            for (const child of [].slice.call(pattern.children)) {
              if (child.hasAttribute('stroke')) {
                child.setAttribute('stroke', newColor);
              }
            }
          }
        }
        break;
      case 'ellipse':
        targetObject.setAttribute('stroke', newColor);
        break;
      case 'polygon':
        targetObject.setAttribute('stroke', newColor);
        break;
      case 'polyline':
        break;
      case 'svg':
        // Canvas
        break;
      default:
        alert('Object is of type ' + targetObject.nodeName + ' and this case is not treated!');
        break;
    }
  }
  set _renderer(rend: Renderer2) {
    this.renderer = rend;
  }
}
