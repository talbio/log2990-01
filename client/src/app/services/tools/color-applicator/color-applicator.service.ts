import { Injectable } from '@angular/core';

@Injectable()
export class ColorApplicatorService {

  changePrimaryColor(targetObject: HTMLElement, newColor: string) {
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
      case 'svg':
        // Canvas
        break;
      default:
        alert('Object is of type ' + targetObject.nodeName + ' and this case is not treated!');
        break;
    }
  }

}
