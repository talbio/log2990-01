import { Injectable } from '@angular/core';
import { AbstractWritingTool } from 'src/app/data-structures/abstract-writing-tool';
import { DEFAULT_AEROSOL_DOT_RADIUS,
         DEFAULT_AEROSOL_SPRAY_DIAMETER,
         DEFAULT_SPRAY_INTERVAL_SPEED } from 'src/app/data-structures/constants';
import { RendererSingleton } from 'src/app/services/renderer-singleton';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { UndoRedoService } from '../../undo-redo/undo-redo.service';

@Injectable()
export class AerosolGeneratorService extends AbstractWritingTool {

  sprayDiameter: number;
  sprayInterval: number;
  dotRadius: number;
  dotArray: SVGElement[];
  sprayIntervalSpeed: number;
  private subpathIndex: number;

  constructor(protected undoRedoService: UndoRedoService,
              protected mouse: MousePositionService) {
      super(mouse, undoRedoService);
      this.sprayDiameter = DEFAULT_AEROSOL_SPRAY_DIAMETER;
      this.sprayInterval = 0; // Does not mean anything, set to 0 to be initialized
      this.dotArray = [];
      this.subpathIndex = 0;
      this.dotRadius = DEFAULT_AEROSOL_DOT_RADIUS;
      this.sprayIntervalSpeed = DEFAULT_SPRAY_INTERVAL_SPEED;
     }

  createElement(mainColors: [string, string]): void {
    this.mouseDown = true;
    this.spray(mainColors[0]);
  }

  updateElement() {
    // Do nothing, implementation necessary
  }

  finishElement(): void {
    this.mouseDown = false;
    this.stopSpray();
    this.pushGeneratorCommand(...this.dotArray);
    this.dotArray = [];
    this.subpathIndex = 0;
  }

  spray(color: string) {
    this.sprayInterval = window.setInterval(() => {
      this.generateDot(color);
    } , this.sprayIntervalSpeed);
  }

  stopSpray() {
    clearInterval(this.sprayInterval);
  }

  randomPointInRadius(): number[] {
    const length: number = this.randomLength();
    const angle: number = this.randomAngle();
    const xVal: number = length * Math.cos(angle) + this.xPos;
    const yVal: number = length * Math.sin(angle) + this.yPos;
    const point: number[] = [xVal, yVal];
    return point;
  }

  // Returns a random number between 0 and the radius of the spray
  randomLength(): number {
    return Math.random() * this.sprayDiameter / 2;
  }

  // Returns a random number between 0 and 2*PI corresponding to an angle in radians
  randomAngle(): number {
    return Math.random() * Math.PI * 2;
  }

  generateDot(color: string): void {
    // TODO
    const dot: SVGElement = RendererSingleton.renderer.createElement('circle', 'svg');
    const coordinates: number[] = this.randomPointInRadius();
    const properties: [string, string][] = [];
    properties.push(
      ['id', `aerosolSpray${this.currentElementsNumber}`],
      ['r', `${this.dotRadius}`],
      ['cx', `${coordinates[0]}`],
      ['cy', `${coordinates[1]}`],
      ['stroke', 'transparent'],
      ['fill', `${color}`],
    );
    this.drawElement(dot, properties);
    this.dotArray[this.subpathIndex++] = dot;
  }

}
