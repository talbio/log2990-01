import { Injectable } from '@angular/core';
import {
  BOUNDING_RECT_ID, G_BOUNDING_RECT_ID,
  MAX_ROTATION_STEP,
  MIN_ROTATION_STEP
} from '../../data-structures/constants';
import {RendererSingleton} from '../renderer-singleton';
import {Transformation, TransformService} from './transform.service';

@Injectable({
  providedIn: 'root',
})
export class RotateService {

  rotationTimer: number;
  isRotating: boolean;
  lastRotate: string;
  rotationStep: number;
  angle: number;
  initialTransformValues: Map<SVGElement, string>;

  constructor(private transform: TransformService) {
    this.angle = 0;
    this.rotationStep = MAX_ROTATION_STEP;
    this.rotationTimer = 0;
    this.isRotating = false;
  }

  get boundingRect(): SVGElement {
    return this.gBoundingRect.querySelector('#' + BOUNDING_RECT_ID) as SVGGElement;
  }

  get gBoundingRect(): SVGGElement {
    return RendererSingleton.canvas.querySelector('#' + G_BOUNDING_RECT_ID) as SVGGElement;
  }

  lowerRotationStep(): void {
    this.rotationStep = MIN_ROTATION_STEP;
  }

  higherRotationStep(): void {
    this.rotationStep = MAX_ROTATION_STEP;
  }

  changeAngle(mouseWheel: WheelEvent) {
    if (mouseWheel.deltaY < 0) {
      this.angle  += this.rotationStep;
    } else { this.angle  -= this.rotationStep; }
    this.angle  = this.angle % 360;
  }

  beginRotation() {
    this.isRotating = true;
  }

  finishRotation(): void {
    this.angle = 0;
    this.isRotating = false;
  }

  rotateElements(elements: SVGElement[], mouseWheel: WheelEvent) {
    if (!this.isRotating) {
      this.beginRotation();
    }
    this.changeAngle(mouseWheel);
    elements.forEach((element: SVGElement) => {
      this.rotateElement(element, mouseWheel);
    });
  }

  rotateElement(element: SVGElement, mouseWheel: WheelEvent) {
    if (this.boundingRect) {
      let centerX: number;
      let centerY: number;
      if (mouseWheel.shiftKey) {
        centerX = (element.getBoundingClientRect().left + element.getBoundingClientRect().width / 2)
          - RendererSingleton.canvas.getBoundingClientRect().left;
        centerY = (element.getBoundingClientRect().top + element.getBoundingClientRect().height / 2)
          - RendererSingleton.canvas.getBoundingClientRect().top;
      } else {
        centerX = parseFloat(this.boundingRect.getAttribute('x') as string) +
          parseFloat(this.boundingRect.getAttribute('width') as string) / 2;
        centerY = parseFloat(this.boundingRect.getAttribute('y') as string) +
          parseFloat(this.boundingRect.getAttribute('height') as string) / 2;
      }

      const initialTransform: string = this.initialTransformValues.get(element) as string;
      const translates: number[] = this.transform.getTransformationFromMatrix(initialTransform, Transformation.TRANSLATE);
      const scales: number[] = this.transform.getTransformationFromMatrix(initialTransform, Transformation.SCALE);
      const rotates: number[] = this.transform.getTransformationFromMatrix(initialTransform, Transformation.ROTATE);
      const matrix: number[][] = [[scales[0], rotates[0], 0], [rotates[1], scales[1], 0], [translates[0], translates[1], 1]];
      this.transform.rotate(element, matrix, this.transform.degreesToRadians(this.angle), centerX, centerY);
    }
  }

}
