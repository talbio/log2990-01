import { Injectable, Renderer2 } from '@angular/core';
import { BrushGeneratorService } from './../brush-generator/brush-generator.service';
import { LineGeneratorService } from './../line-generator/line-generator.service';

@Injectable()
export class ColorApplicatorService {
  private renderer: Renderer2;
  constructor(private lineGenerator: LineGeneratorService, private brushGenerator: BrushGeneratorService) {}

  changePrimaryColor(targetObject: SVGElement, newColor: string) {
    const defs = this.renderer.selectRootElement('#definitions', true);
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
          // Find the pattern
          const pattern = this.brushGenerator.findPatternFromBrushPath(targetObject, defs);
          // Change color of the fill attribute of all children
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
      case 'polyline':
        targetObject.setAttribute('stroke', newColor);
        // find the markers
        const markers = this.lineGenerator.findMarkerFromPolyline(targetObject, defs);
        // change color of the circles in the markers
        markers.children[0].setAttribute('fill', newColor);
        break;
      case 'image':
        // Image should not change color
        break;
      case 'svg':
        // Canvas
        break;
      default:
        alert('Object is of type ' + targetObject.nodeName + ' and this case is not treated!');
        break;
    }

  }

  changeSecondaryColor(targetObject: SVGElement, newColor: string) {
    const defs = this.renderer.selectRootElement('#definitions', true);
    switch (targetObject.nodeName) {
      case 'rect':
        // Rectangle
        targetObject.setAttribute('stroke', newColor);
        break;
      case 'path':
        // Paths should only be able to change the primary colorSelected, unless they are a paintbrush texture
        if ((targetObject.getAttribute('id') as string).startsWith('brush')) {
          // PaintBrush
          // Find the pattern
          const pattern = this.brushGenerator.findPatternFromBrushPath(targetObject, defs);
          // Change color of the stroke attribute of all children
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
      case 'polyline':
        break;
      case 'image':
          // Image should not change color
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
