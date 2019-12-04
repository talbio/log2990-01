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

  private readonly X_ROTATE_INDEX = 1;
  private readonly Y_ROTATE_INDEX = 2;

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
      case Transformation.ROTATE:
        return [matrix[this.X_ROTATE_INDEX], matrix[this.Y_ROTATE_INDEX]];
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

  rotate(svgElement: SVGElement, initialMatrix: number[][], angle: number, centerX: number, centerY: number): void {
    this.checkTransformAttribute(svgElement);
    const matrix: number[] = this.getNumericalMatrix(svgElement.getAttribute('transform') as string);
    const newMatrix: number[][] = this.rotatedMatrix(initialMatrix, angle, centerX, centerY);
    matrix[this.X_SCALE_INDEX] = newMatrix[0][0];
    matrix[this.X_ROTATE_INDEX] = newMatrix[0][1];
    matrix[this.Y_ROTATE_INDEX] = newMatrix[1][0];
    matrix[this.Y_SCALE_INDEX] = newMatrix[1][1];
    matrix[this.X_TRANSLATE_INDEX] = newMatrix[2][0];
    matrix[this.Y_TRANSLATE_INDEX] = newMatrix[2][1];
    this.setMatrix(svgElement, matrix);
  }

  rotationMatrix(angle: number, centerX: number, centerY: number): number[][] {
    return this.produceMatrix(Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), centerX, centerY);
  }

  offsetMatrix(centerX: number, centerY: number): number[][] {
    return this.produceMatrix(1, 0, 0, 1, -centerX, -centerY);
  }

  completeRotationMatrix(angle: number, centerX: number, centerY: number): number[][] {
    const rotationMatrix: number[][] = this.rotationMatrix(angle, centerX, centerY);
    const offsetMatrix: number[][] = this.offsetMatrix(centerX, centerY);
    return this.multiplyMatrices(rotationMatrix, offsetMatrix);
  }

  rotatedMatrix(initialMatrix: number[][], angle: number, centerX: number, centerY: number): number[][] {
    const rotation: number[][] = this.completeRotationMatrix(angle, centerX, centerY);
    return this.multiplyMatrices(rotation, initialMatrix);
  }

  produceMatrix(a: number, b: number, c: number, d: number, e: number, f: number): number[][] {
    const matrix = [[0]];
    matrix[0] = [a, b, 0];
    matrix[1] = [c, d, 0];
    matrix[2] = [e, f, 1];
    return matrix;
  }

  multiplyMatrices(mat1: number[][], mat2: number[][]): number[][] {
    const matrix = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    // 1st line
    matrix[0][0] = mat1[0][0] * mat2[0][0] + mat1[1][0] * mat2[0][1] + mat1[2][0] * mat2[0][2];
    matrix[1][0] = mat1[0][0] * mat2[1][0] + mat1[1][0] * mat2[1][1] + mat1[2][0] * mat2[1][2];
    matrix[2][0] = mat1[0][0] * mat2[2][0] + mat1[1][0] * mat2[2][1] + mat1[2][0] * mat2[2][2];

    // 2nd line
    matrix[0][1] = mat1[0][1] * mat2[0][0] + mat1[1][1] * mat2[0][1] + mat1[2][1] * mat2[0][2];
    matrix[1][1] = mat1[0][1] * mat2[1][0] + mat1[1][1] * mat2[1][1] + mat1[2][1] * mat2[1][2];
    matrix[2][1] = mat1[0][1] * mat2[2][0] + mat1[1][1] * mat2[2][1] + mat1[2][1] * mat2[2][2];

    // 3rd line
    matrix[0][2] = mat1[0][2] * mat2[0][0] + mat1[1][2] * mat2[0][1] + mat1[2][2] * mat2[0][2];
    matrix[1][2] = mat1[0][2] * mat2[1][0] + mat1[1][2] * mat2[1][1] + mat1[2][2] * mat2[1][2];
    matrix[2][2] = mat1[0][2] * mat2[2][0] + mat1[1][2] * mat2[2][1] + mat1[2][2] * mat2[2][2];
    return matrix;
  }
  degreesToRadians(angle: number) {
    return angle * (Math.PI / 180);
  }
}
