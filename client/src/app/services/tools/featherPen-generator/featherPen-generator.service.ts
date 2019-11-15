import { Injectable } from '@angular/core';
import { BOTTOM_AFTER, BOTTOM_BEFORE, DEFAULT_ANGLE, MAX_ROTATION_STEP, MIN_ROTATION_ANGLE, MIN_ROTATION_STEP, TOP_AFTER, TOP_BEFORE, X, Y } from 'src/app/data-structures/constants';
import { AbstractWritingTool } from '../../../data-structures/abstract-writing-tool';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { RendererSingleton } from '../../renderer-singleton';
import { UndoRedoService } from '../../undo-redo/undo-redo.service';

@Injectable()
export class FeatherPenGeneratorService extends AbstractWritingTool {

  angle: number;
  rotationStep: number;
  color: string;
  idPrefix: string;
  pathArray: SVGElement[];
  polygonPoints: number[][];
  private subpathIndex: number;

  constructor(protected undoRedoService: UndoRedoService,
              protected mouse: MousePositionService) {
      super(mouse, undoRedoService);
      this.angle = DEFAULT_ANGLE;
      this.idPrefix = 'featherPenPath';
      this.polygonPoints = [[0, 0], [0, 0], [0, 0], [0, 0]];
      this.strokeWidth = 15;
      this.pathArray = [];
      this.subpathIndex = 0;
  }

  get rotationAngle() {
      return this.angle;
  }

  set rotationAngle(angle: number) {
    if(angle > 180) {
      angle = 0;
    } else if (angle < 0) {
      angle = 180;
    } else {
      this.angle = angle;
    }
  }

  lowerRotationStep(): void {
      this.rotationStep = MIN_ROTATION_STEP;
  }

  higherRotationStep(): void {
      this.rotationStep = MAX_ROTATION_STEP;
  }

  rotateFeather(mouseEvent: WheelEvent): void {
    if (mouseEvent.deltaY < MIN_ROTATION_ANGLE) {
        this.angle  += this.rotationStep;
    } else { this.angle  -= this.rotationStep; }
    // if (this.angle > MAX_ROTATION_ANGLE) {this.angle  = MAX_ROTATION_ANGLE; }
    // if (this.angle  < MIN_ROTATION_ANGLE) {this.angle  = MIN_ROTATION_ANGLE; }

  }

  createElement(mainColors: string[]) {
      this.color = mainColors[1];
      this.initializePoints();
      this.getNewPoints();
      this.producePolygon();
      this.actualizePoints();
      this.mouseDown = true;
  }

  updateElement() {
      if (this.mouseDown) {
          this.getNewPoints();
          this.producePolygon();
          this.actualizePoints();
      }
  }

  finishElement(): void {
      if (this.mouseDown) {
          this.currentElementsNumber += 1;
          this.pushGeneratorCommand(...this.pathArray);
          this.pathArray = [];
          this.mouseDown = false;
          this.subpathIndex = 0;
      }
  }

  initializePoints() {
      this.polygonPoints[TOP_BEFORE][X] = this.xPos + Math.cos(this.angle) * (this.strokeWidth / 2);
      this.polygonPoints[TOP_BEFORE][Y] = this.yPos + Math.sin(this.angle) * (this.strokeWidth / 2);
      this.polygonPoints[BOTTOM_BEFORE][X] = this.xPos - Math.cos(this.angle) * (this.strokeWidth / 2);
      this.polygonPoints[BOTTOM_BEFORE][Y] = this.yPos - Math.sin(this.angle) * (this.strokeWidth / 2);
  }

  getNewPoints() {
      this.polygonPoints[TOP_AFTER][X] = this.xPos + Math.cos(this.angle) * (this.strokeWidth / 2);
      this.polygonPoints[TOP_AFTER][Y] = this.yPos + Math.sin(this.angle) * (this.strokeWidth / 2);
      this.polygonPoints[BOTTOM_AFTER][X] = this.xPos - Math.cos(this.angle) * (this.strokeWidth / 2);
      this.polygonPoints[BOTTOM_AFTER][Y] = this.yPos - Math.sin(this.angle) * (this.strokeWidth / 2);
  }

  actualizePoints() {
    this.polygonPoints[TOP_BEFORE][X] = this.polygonPoints[TOP_AFTER][X];
    this.polygonPoints[TOP_BEFORE][Y] = this.polygonPoints[TOP_AFTER][Y];
    this.polygonPoints[BOTTOM_BEFORE][X] = this.polygonPoints[BOTTOM_AFTER][X];
    this.polygonPoints[BOTTOM_BEFORE][Y] = this.polygonPoints[BOTTOM_AFTER][Y];
  }

  producePolygon() {
      let points = '';
      this.polygonPoints.forEach((element) => {
          points += ('' + element[X] + ',' + element[Y] + ' ');
      });
      const polygon = RendererSingleton.renderer.createElement('polygon', 'svg');
      const properties: [string, string][] = [];
      properties.push(
        ['id', this.idPrefix + this.currentElementsNumber],
        ['points', points],
        ['stroke', this.color],
        ['stroke-width', '2'],
        ['fill', this.color],
      );
      this.drawElement(polygon, properties);
      this.pathArray[this.subpathIndex++] = polygon;
  }
}
