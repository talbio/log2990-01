import { Injectable } from '@angular/core';

@Injectable()
export class TransformationService {

setTranslationAttribute = (element: SVGElement, xTranslation: number, yTranslation: number): void => {
    const transformation = element.getAttribute('transform');
    let newTransform = '';
    if (!transformation) {
        newTransform = 'translate(' + xTranslation + ' ' + yTranslation + ')';
    } else if (!transformation.includes('translate')) {
        newTransform = 'translate(' + xTranslation + ' ' + yTranslation + ') ';
        newTransform += transformation;
    } else {
        const oldTranslation: number[] = this.findTransformValues(transformation, 'translate');
        const translateBegin = transformation.indexOf('translate');
        const translateEnd = transformation.indexOf(')', translateBegin);
        newTransform = transformation.substr(0, translateBegin) +
                    'translate(' + (oldTranslation[0] + xTranslation) + ' ' + (oldTranslation[1] + yTranslation) + ') ' +
                    transformation.substr(translateEnd + 1);
    }
    element.setAttribute('transform', newTransform);
}
findTransformValues = (transformation: string, attribute: string): number[] => {
    const attributeIndex = transformation.indexOf(`${attribute}(`);
    if (attributeIndex === -1) {
        return [0, 0];
    }
    const spaceIndex = transformation.indexOf(' ', attributeIndex);
    const endOfAttribute = transformation.indexOf(')', spaceIndex);
    const xValue = transformation.substring(attributeIndex + 10, spaceIndex);
    const yValue = transformation.substring(spaceIndex + 1, endOfAttribute);
    const values: number[] = [parseFloat(xValue), parseFloat(yValue)];
    return values;
}

}
