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
  sprayIntervalTimer: number;
  secondSprayIntervalTimer: number;
  dotRadius: number;
  dotArray: SVGElement[];
  sprayIntervalSpeed: number;
  private subpathIndex: number;

  get _sprayDiameter(): number {
    return this.sprayDiameter;
  }
  set _sprayDiameter(diameter: number) {
    this.sprayDiameter = diameter;
    this.dotRadius = diameter / 4;
  }
  constructor(protected undoRedoService: UndoRedoService,
              protected mouse: MousePositionService) {
    super(mouse, undoRedoService);
    this.sprayDiameter = DEFAULT_AEROSOL_SPRAY_DIAMETER;
    this.sprayIntervalTimer = 0; // Does not mean anything, set to 0 to be initialized
    this.secondSprayIntervalTimer = 0;
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
    if (this.sprayIntervalSpeed >= 10) {
      this.sprayIntervalTimer = window.setInterval(() => {
        this.generateDot(color);
      } , this.sprayIntervalSpeed);
    } else {
      // interval speed limit is 10 ms, so we start a second interval to force a faster spray
      this.sprayIntervalTimer = window.setInterval(() => {
        this.generateDot(color);
      } , this.sprayIntervalSpeed * 2);
      this.secondSprayIntervalTimer = window.setInterval(() => {
        this.generateDot(color);
      } , this.sprayIntervalSpeed * 2);
    }
  }

  stopSpray() {
    window.clearInterval(this.sprayIntervalTimer);
    if (this.sprayIntervalSpeed < 10) {
      window.clearInterval(this.secondSprayIntervalTimer);
    }

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
