import { Injectable, Renderer2 } from '@angular/core';
import { MousePositionService } from './../../mouse-position/mouse-position.service';
import { ColorService } from './../color/color.service';

@Injectable()
export class EyedropperService {
  private renderer: Renderer2;

  constructor(private colorTool: ColorService, private mousePosition: MousePositionService) {
    // nothing to do here
  }
  // This function returns the color on the object as a string of format "rgba(rVal,gVal,bVal,aVal)"
  getColorOnObject(object: SVGElement): string {
    let foundColor = '';
    switch (object.nodeName) {
      case 'rect':
        // Rectangle
        foundColor = object.getAttribute('fill') as string;
        break;
      case 'path':
        // Check specific type of path
        if (object.id.startsWith('pencil')) {
          // Pencil
          foundColor = object.getAttribute('stroke') as string;
        } else if (object.id.startsWith('brush')) {
          // PaintBrush
          // attribute stroke for brush paths are structed as follows: url(#brushPatternX), therefore the id is in substring 5 to 18
          const pattern = this.renderer.selectRootElement((object.getAttribute('stroke') as string).substring(5, 18));
          for (const child of [].slice.call(pattern.children)) {
            if (child.hasAttribute('fill')) {
              foundColor = child.getAttribute('fill');
            }
          }
        } else {
          alert(`Object id is "${object.id}" and this case is not treated!`);
        }
        break;
      case 'ellipse':
        foundColor = object.getAttribute('fill') as string;
        break;
      case 'polyline':
        foundColor = object.getAttribute('stroke') as string;
        break;
      case 'image':
        const imageObject = object as SVGImageElement;
        const canvElem = this.renderer.createElement('canvas');
        const appworkzone = this.renderer.selectRootElement('app-work-zone', true);
        canvElem.height = imageObject.getAttribute('height');
        canvElem.width = imageObject.getAttribute('width');
        this.renderer.appendChild(appworkzone, canvElem);
        const context = canvElem.getContext('2d');
        context.drawImage(imageObject, 0, 0);
        const pictureX = this.mousePosition._canvasMousePositionX - parseFloat(imageObject.getAttribute('x') as string);
        const pictureY = this.mousePosition._canvasMousePositionY - parseFloat(imageObject.getAttribute('y') as string);
        const pixData = context.getImageData(pictureX, pictureY, 1, 1);
        foundColor = `rgba(${pixData.data[0]},${pixData.data[1]},${pixData.data[2]},${pixData.data[3]})`;
        this.renderer.removeChild(appworkzone, canvElem);
        break;
      case 'svg':
        // Canvas
        foundColor = object.style.backgroundColor as string;
        break;
      default:
        alert(`Object is of type "${object.nodeName}" and this case is not treated!`);
        break;
    }
    if (foundColor !== '') {
      if (foundColor.startsWith('rgba')) {
        return foundColor;
      } else if (foundColor.startsWith('rgb')) {
        // Take rgb value and make it a fully opaque rgba value
        foundColor = foundColor.replace(')', ', 1)').replace('rgb', 'rgba');
        return foundColor;
      } else if (foundColor === 'transparent') {
        return `rgba(0,0,0,0)`;
      } else {
        // untreated case but still found a value
        return foundColor;
      }
    } else {
      // If no value is found, return the primary color (this should only happen in untreated cases during development)
      return this.colorTool.getPrimaryColor();
    }
  }

  changePrimaryColor(object: SVGElement) {
    const objectColor = this.getColorOnObject(object);
    this.colorTool.setPrimaryColor(objectColor);
  }

  changeSecondaryColor(object: SVGElement) {
    const objectColor = this.getColorOnObject(object);
    this.colorTool.setSecondaryColor(objectColor);
  }

  // This function gets the exact color of the hovered pixel by transfering the svg to an html5 canvas element.
  // NOT WORKING, can't transfer svg to image
  // getColorOnPixel(object: SVGElement): string {

  //   let foundColor = '';
  //   const imageObject = object as SVGImageElement;
  //   const canvElem = this.renderer.createElement('canvas');
  //   const appworkzone = this.renderer.selectRootElement('app-work-zone', true);
  //   canvElem.height = imageObject.getAttribute('height');
  //   canvElem.width = imageObject.getAttribute('width');
  //   this.renderer.appendChild(appworkzone, canvElem);
  //   const context = canvElem.getContext('2d');
  //   context.drawImage(imageObject, 0, 0);
  //   const pictureX = this.mousePosition._canvasMousePositionX - parseFloat(imageObject.getAttribute('x') as string);
  //   const pictureY = this.mousePosition._canvasMousePositionY - parseFloat(imageObject.getAttribute('y') as string);
  //   const pixData = context.getImageData(pictureX, pictureY, 1, 1);
  //   foundColor = `rgba(${pixData.data[0]},${pixData.data[1]},${pixData.data[2]},${pixData.data[3]})`;
  //   console.log(foundColor);

  //   // this.renderer.removeChild(appworkzone, canvElem);

  //   if (foundColor !== '') {
  //     if (foundColor.startsWith('rgba')) {
  //       return foundColor;
  //     } else if (foundColor.startsWith('rgb')) {
  //       // Take rgb value and make it a fully opaque rgba value
  //       foundColor = foundColor.replace(')', ', 1)').replace('rgb', 'rgba');
  //       return foundColor;
  //     } else if (foundColor === 'transparent') {
  //       return `rgba(0,0,0,0)`;
  //     } else {
  //       // untreated case but still found a value
  //       return foundColor;
  //     }
  //   } else {
  //     // If no value is found, return the primary color (this should only happen in untreated cases during development)
  //     return this.colorTool.getPrimaryColor();
  //   }
  // }
  set _renderer(rend: Renderer2) {
    this.renderer = rend;
  }

}
