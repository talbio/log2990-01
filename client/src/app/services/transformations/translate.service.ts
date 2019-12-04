import { Injectable } from '@angular/core';
import {MousePositionService} from '../mouse-position/mouse-position.service';
import {GridTogglerService} from '../tools/grid/grid-toggler.service';
import {MagnetismService} from '../tools/magnetism/magnetism.service';
import {TransformService} from './transform.service';

@Injectable({
  providedIn: 'root',
})
export class TranslateService {

  isTranslating: boolean;
  startDomRect: DOMRect;

  initialX: number;
  initialY: number;

  constructor(private grid: GridTogglerService,
              private magnetism: MagnetismService,
              private mousePosition: MousePositionService,
              private transform: TransformService) {
    this.isTranslating = false;
  }

  beginTranslation(): void {
    this.isTranslating = true;
  }

  finishTranslation(): void {
    this.isTranslating = false;
  }

  translate(selectedElements: SVGElement[]) {
    const xMove = this.mousePosition.canvasMousePositionX - this.startDomRect.x;
    const yMove = this.mousePosition.canvasMousePositionY - this.startDomRect.y;
    selectedElements.forEach((svgElement: SVGElement) => {
      this.transform.translate(svgElement, xMove, yMove);
      this.startDomRect.x = this.mousePosition.canvasMousePositionX;
      this.startDomRect.y = this.mousePosition.canvasMousePositionY;
    });
  }

  translateWithMagnetism(selectedElements: SVGElement[], domRect: DOMRect) {
    this.grid.setSelectedDotPosition(domRect);
    const newPosition: number[] = this.magnetism.getTranslationWithMagnetismValue(this.initialX, this.initialY);
    const xMove = newPosition[0];
    const yMove = newPosition[1];
    if (xMove !== 0 || yMove !== 0) {
      this.initialX = this.mousePosition.canvasMousePositionX;
      this.initialY = this.mousePosition.canvasMousePositionY;
    }
    selectedElements.forEach((svgElement: SVGElement) => {
      this.transform.translate(svgElement, xMove, yMove);
      this.startDomRect.x = this.mousePosition.canvasMousePositionX;
      this.startDomRect.y = this.mousePosition.canvasMousePositionY;
    });
  }
}
