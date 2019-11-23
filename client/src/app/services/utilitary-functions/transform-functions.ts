// This finds out whether the element has a transform value and adapts the translation
export const setTranslationAttribute = (element: SVGElement, xTranslation: number, yTranslation: number): void => {
    const transformation = element.getAttribute('transform');
    let newTransform = '';
    if (!transformation) {
        newTransform = 'translate(' + xTranslation + ' ' + yTranslation + ')';
    } else if (!transformation.includes('translate')) {
        newTransform = 'translate(' + xTranslation + ' ' + yTranslation + ') ';
        newTransform += transformation;
    } else {
        const oldTranslation: number[] = findTransformValues(transformation);
        const translateBegin = transformation.indexOf('translate');
        const translateEnd = transformation.indexOf(')', translateBegin);
        newTransform =
          'translate(' + (oldTranslation[0] + xTranslation) + ' ' + (oldTranslation[1] + yTranslation) + ') ' +
          transformation.substr(0, translateBegin) + transformation.substr(translateEnd + 1);
    }
    element.setAttribute('transform', newTransform);
};

export const findTransformValues = (transformAttribute: string): number[] => {
  const parts  = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(transformAttribute) as RegExpExecArray;
  return [parseFloat(parts[1]), parseFloat(parts[2])];
};

export const setScaleAttribute = (element: SVGElement, xScale: number, yScale: number): void => {
  const transformation = element.getAttribute('transform');
  let newTransform = '';
  if (!transformation) {
    newTransform = 'scale(' + xScale + ' ' + yScale + ')';
  } else if (!transformation.includes('scale')) {
    newTransform = 'scale(' + xScale + ' ' + yScale + ') ';
    newTransform += transformation;
  } else {
    // const oldTranslation: number[] = findScaleValues(transformation);
    const scaleBegin = transformation.indexOf('scale');
    const scaleEnd = transformation.indexOf(')', scaleBegin);
    newTransform =
      transformation.substr(0, scaleBegin) + transformation.substr(scaleEnd + 1) +
      'scale(' + (xScale) + ' ' + (yScale) + ') ';
  }
  element.setAttribute('transform', newTransform);
};

export const findScaleValues = (transformAttribute: string): number[] => {
  const parts  = /scale\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(transformAttribute) as RegExpExecArray;
  return [parseFloat(parts[1]), parseFloat(parts[2])];
};
