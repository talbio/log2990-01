import { Injectable } from '@angular/core';
import {MousePositionService} from '../mouse-position/mouse-position.service';
import {Transformation, TransformService} from './transform.service';

@Injectable({
  providedIn: 'root',
})
export class ScaleService {

  scaleFromCenter: boolean;
  startDimensions: DOMRect;
  isScaling: boolean;
  currentMarkerId: string;
  initialTransformValues: Map<SVGElement, string>;

  constructor(private mousePosition: MousePositionService,
              private transform: TransformService) {
    this.isScaling = false;
    this.scaleFromCenter = false;
  }

  scale(preserveRatio: boolean, selectedElements: SVGElement[]): void {
    if (this.isScaling) {
      const scalingFactors: [number, number, number, number] = this.getScalingFactors(preserveRatio);
      const scalingFactorX: number = scalingFactors[0];
      const scalingFactorY: number = scalingFactors[1];
      const xCorrection: number = scalingFactors[2];
      const yCorrection: number = scalingFactors[3];
      // this.scaleElement(this.gBoundingRect, scalingFactorX, scalingFactorY);
      selectedElements.forEach( (svgElement: SVGElement) => {
        this.scaleElement(svgElement, scalingFactorX, scalingFactorY, xCorrection, yCorrection);
        // console.log(scalingFactorX, scalingFactorY);
      });

    }
  }

  private getScalingFactors(preserveRatio: boolean): [number, number, number, number] {
    let scalingFactorX: number;
    let scalingFactorY: number;

    scalingFactorY = 1;
    scalingFactorX = 1;

    if (this.currentMarkerId.includes('top')) {
      scalingFactorY = 1 + -(this.mousePosition.canvasMousePositionY - this.startDimensions.y) / this.startDimensions.height;
    } else if (this.currentMarkerId.includes('bottom')) {
      scalingFactorY = 1 + (this.mousePosition.canvasMousePositionY - this.startDimensions.y) / this.startDimensions.height;
    }
    if (this.currentMarkerId.includes('left')) {
      scalingFactorX = 1 + -(this.mousePosition.canvasMousePositionX - this.startDimensions.x) / this.startDimensions.width;
    } else if (this.currentMarkerId.includes('right')) {
      scalingFactorX = 1 + (this.mousePosition.canvasMousePositionX - this.startDimensions.x) / this.startDimensions.width;
    }
    if (preserveRatio) {
      if (Math.abs(scalingFactorX) > Math.abs(scalingFactorY)) {
        scalingFactorY = scalingFactorX;
      } else {
        scalingFactorX = scalingFactorY;
      }
    }
    const corrections: number[] = this.calculateCorrection(scalingFactorX, scalingFactorY);
    return [scalingFactorX, scalingFactorY, corrections[0], corrections[1]];
  }

  scaleElement(svgElement: SVGElement, scalingFactorX: number, scalingFactorY: number, xCorrection: number, yCorrection: number): void {
    const initialScaleValues: [number, number] =
      this.transform.getTransformationFromMatrix(this.initialTransformValues.get(svgElement) as string, Transformation.SCALE);
    // console.log('scales values: ' + initialScaleValues[0] + ', ' + initialScaleValues[1]);
    const initialTranslateValues: [number, number] =
      this.transform.getTransformationFromMatrix(this.initialTransformValues.get(svgElement) as string, Transformation.TRANSLATE);
    this.transform.scale(svgElement, scalingFactorX, scalingFactorY, initialScaleValues[0], initialScaleValues[1]);
    const correctedInitialX = initialTranslateValues[0] * scalingFactorX;
    const correctedInitialY = initialTranslateValues[1] * scalingFactorY;
    this.transform.translate(svgElement, xCorrection, yCorrection, correctedInitialX, correctedInitialY);
  }

  private calculateCorrection(scalingFactorX: number, scalingFactorY: number): number[] {
    let xCorrection: number;
    let yCorrection: number;
    xCorrection = 0;
    yCorrection = 0;
    let height: number;
    let width: number;
    if (this.scaleFromCenter) {
      height = this.startDimensions.height / 2;
      width = this.startDimensions.width / 2;
    } else {
      height = this.startDimensions.height;
      width = this.startDimensions.width;
    }
    if (this.currentMarkerId.includes('top')) {
      yCorrection = -((this.startDimensions.y + height) * (scalingFactorY - 1));
    } else if (this.currentMarkerId.includes('bottom')) {
      yCorrection = -((this.startDimensions.y - height) * (scalingFactorY - 1));
    }
    if (this.currentMarkerId.includes('left')) {
      xCorrection = -((this.startDimensions.x + width) * (scalingFactorX - 1));
    } else if (this.currentMarkerId.includes('right')) {
      xCorrection = -((this.startDimensions.x - width) * (scalingFactorX - 1));
    }
    return [xCorrection, yCorrection];
  }
}
