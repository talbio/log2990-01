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
        newTransform = transformation.substr(0, translateBegin) +
                    'translate(' + (oldTranslation[0] + xTranslation) + ' ' + (oldTranslation[1] + yTranslation) + ') ' +
                    transformation.substr(translateEnd + 1);
    }
    element.setAttribute('transform', newTransform);
};
export const findTransformValues = (transformation: string): number[] => {
    const translateIndex = transformation.indexOf('translate(');
    const spaceIndex = transformation.indexOf(' ', translateIndex);
    const endOfTranslation = transformation.indexOf(')', spaceIndex);
    const xValue = transformation.substring(translateIndex + 10, spaceIndex);
    const yValue = transformation.substring(spaceIndex + 1, endOfTranslation);
    const values: number[] = [parseFloat(xValue), parseFloat(yValue)];
    return values;
};
