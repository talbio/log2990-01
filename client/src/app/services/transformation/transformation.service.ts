import { Injectable } from '@angular/core';

export enum Transformation {
  TRANSLATE,
  SCALE,
  ROTATE,
}

@Injectable()
export class TransformationService {

  private readonly X_TRANSLATE_INDEX = 4;
  private readonly Y_TRANSLATE_INDEX = 5;

  private readonly X_SCALE_INDEX = 0;
  private readonly Y_SCALE_INDEX = 3;

  checkTransformAttribute(svgElement: SVGElement): void {
    if (!svgElement.getAttribute('transform')) {
      svgElement.setAttribute('transform', 'matrix(1,0,0,1,0,0)');
    }
  }

  private getNumericalMatrix(matrix: string): number[] {
    const firstParenthesis = matrix.indexOf('(');
    return (matrix.substring(firstParenthesis + 1, matrix.length - 1).split(',').map(Number));
  }

  private setMatrix(svgElement: SVGElement, matrix: number[]): void {
    const strMatrix: string = 'matrix(' + matrix.join(',') + ')';
    svgElement.setAttribute('transform', strMatrix);
  }

  getTransformationFromElement(svgElement: SVGElement, transformType: Transformation): [number, number] {
    this.checkTransformAttribute(svgElement);
    const matrix: number[] = this.getNumericalMatrix(svgElement.getAttribute('transform') as string);
    switch (transformType) {
      case Transformation.SCALE:
        return [matrix[this.X_SCALE_INDEX], matrix[this.Y_SCALE_INDEX]];
      case Transformation.TRANSLATE:
        return [matrix[this.X_TRANSLATE_INDEX], matrix[this.Y_TRANSLATE_INDEX]];
      // TODO: default case should not exist, implement for rotate
      default:
        return [0, 0];

    }
  }

  getTransformationFromMatrix(matrix: string, transformType: Transformation): [number, number] {
    const numericalMatrix: number[] = this.getNumericalMatrix(matrix);
    switch (transformType) {
      case Transformation.SCALE:
        return [numericalMatrix[this.X_SCALE_INDEX], numericalMatrix[this.Y_SCALE_INDEX]];
      case Transformation.TRANSLATE:
        return [numericalMatrix[this.X_TRANSLATE_INDEX], numericalMatrix[this.Y_TRANSLATE_INDEX]];
        // TODO: default case should not exist, implement for rotate
      default:
        return [0, 0];
    }
  }

  getScaleValues(svgElement: SVGElement): [number, number] {
    this.checkTransformAttribute(svgElement);
    const matrix: number[] = this.getNumericalMatrix(svgElement.getAttribute('transform') as string);
    return [matrix[this.X_SCALE_INDEX], matrix[this.Y_SCALE_INDEX]];
  }

  translate(svgElement: SVGElement, x: number, y: number, initialX?: number, initialY?: number): void {
    this.checkTransformAttribute(svgElement);
    const matrix: number[] = this.getNumericalMatrix(svgElement.getAttribute('transform') as string);
    matrix[this.X_TRANSLATE_INDEX] = (initialX !== undefined) ? initialX + x : matrix[this.X_TRANSLATE_INDEX] + x;
    matrix[this.Y_TRANSLATE_INDEX] = (initialY !== undefined) ? initialY + y : matrix[this.Y_TRANSLATE_INDEX] + y;
    this.setMatrix(svgElement, matrix);
  }

  scale(svgElement: SVGElement, x: number, y: number, initialX: number, initialY: number): void {
    this.checkTransformAttribute(svgElement);
    const matrix: number[] = this.getNumericalMatrix(svgElement.getAttribute('transform') as string);
    matrix[this.X_SCALE_INDEX] = initialX * x;
    matrix[this.Y_SCALE_INDEX] = initialY * y;
    this.setMatrix(svgElement, matrix);
  }

  rotate()

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
