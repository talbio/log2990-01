import { Injectable } from '@angular/core';

@Injectable()
export class TransformationService {

// This finds out whether the element has a transform value and adapts the translation
setTranslationAttribute =
  (element: SVGElement, xTranslation: number, yTranslation: number, erase?: boolean, initialScale?: boolean): void => {
    const transformation = element.getAttribute('transform');
    let newTransform = '';
    if (!transformation) {
      newTransform = 'translate(' + xTranslation + ' ' + yTranslation + ')';
    } else if (!transformation.includes('translate') || initialScale) {
      newTransform = 'translate(' + xTranslation + ' ' + yTranslation + ') ';
      newTransform += transformation;
    } else {
      const oldTranslation: number[] = this.findTransformValues(transformation);
      const translateBegin = transformation.indexOf('translate');
      const translateEnd = transformation.indexOf(')', translateBegin);
      newTransform =
        'translate(' + ( (erase ? 0 : oldTranslation[0]) + xTranslation) + ' ' +
        ( (erase ? 0 : oldTranslation[1]) + yTranslation) + ') ' +
        transformation.substr(0, translateBegin) + transformation.substr(translateEnd + 1);
    }
    element.setAttribute('transform', newTransform) ;
  }

findTransformValues = (transformAttribute: string): number[] => {
  const parts  = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(transformAttribute) as RegExpExecArray;
  return [parseFloat(parts[1]), parseFloat(parts[2])];
}

  setScaleAttribute = (element: SVGElement, xScale: number, yScale: number, initialScale?: boolean): void => {
    const transformation = element.getAttribute('transform');
    let newTransform = '';
    if (!transformation) {
      newTransform = 'scale(' + xScale + ' ' + yScale + ')';
    } else if (!transformation.includes('scale') || initialScale) {
      const newScale = 'scale(' + xScale + ' ' + yScale + ') ';
      newTransform += transformation;
      newTransform += newScale;
    } else {
      // const oldTranslation: number[] = findScaleValues(transformation);
      const lastScaleBegin = transformation.lastIndexOf('scale');
      // const lastScaleEnd = transformation.lastIndexOf(')', lastScaleBegin);
      newTransform = transformation.substr(0, lastScaleBegin) + /* transformation.substr(lastScaleEnd + 1) + */
        'scale(' + (xScale) + ' ' + (yScale) + ') ';
    }
    element.setAttribute('transform', newTransform);
  }

  findScaleValues = (transformAttribute: string): number[] => {
    const parts = /scale\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(transformAttribute) as RegExpExecArray;
    return [parseFloat(parts[1]), parseFloat(parts[2])];
  }
}
