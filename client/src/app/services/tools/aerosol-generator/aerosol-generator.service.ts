import { Injectable } from '@angular/core';
import { AbstractWritingTool } from 'src/app/data-structures/abstract-writing-tool';
import { DEFAULT_AEROSOL_SPRAY_DIAMETER,
         DEFAULT_DOTS_PER_SPRAY,
         DEFAULT_SPRAY_INTERVAL_SPEED,
         DOT_RADIUS_RATIO} from 'src/app/data-structures/constants';
import { RendererSingleton } from 'src/app/services/renderer-singleton';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { UndoRedoService } from '../../undo-redo/undo-redo.service';

const SPRAY_URL = 'url(#spray)';
@Injectable()
export class AerosolGeneratorService extends AbstractWritingTool {

  sprayDiameter: number;
  sprayIntervalTimer: number;
  dotRadius: number;
  dotArray: SVGElement[];
  sprayIntervalSpeed: number;
  dotsPerSpray: number;
  private subpathIndex: number;

  get _sprayDiameter(): number {
    return this.sprayDiameter;
  }
  set _sprayDiameter(diameter: number) {
    this.sprayDiameter = diameter;
    this.dotRadius = this.calculateSprayDotRadius(diameter);
  }
  constructor(protected undoRedoService: UndoRedoService,
              protected mouse: MousePositionService) {
    super(mouse, undoRedoService);
    // we use the setter to also initiate dotRadius
    this._sprayDiameter = DEFAULT_AEROSOL_SPRAY_DIAMETER;
    this.sprayIntervalTimer = 0; // Does not mean anything, set to 0 to be initialized
    this.dotArray = [];
    this.subpathIndex = 0;
    this.sprayIntervalSpeed = DEFAULT_SPRAY_INTERVAL_SPEED;
    this.dotsPerSpray = DEFAULT_DOTS_PER_SPRAY;
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
    this.currentElementsNumber += 1;
    this.pushGeneratorCommand(...this.dotArray);
    this.dotArray = [];
    this.subpathIndex = 0;
  }

  spray(color: string) {
    this.sprayIntervalTimer = window.setInterval(() => {
      for (let i = 0; i < this.dotsPerSpray; i++ ) {
        this.generateDot(color);
      }

    } , this.sprayIntervalSpeed);
  }

  stopSpray() {
    window.clearInterval(this.sprayIntervalTimer);
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
    const dot: SVGElement = RendererSingleton.renderer.createElement('circle', 'svg');
    const coordinates: number[] = this.randomPointInRadius();
    const properties: [string, string][] = [];
    properties.push(
      ['id', `aerosolSpray${this.currentElementsNumber}`],
      ['r', `${this.dotRadius}`],
      ['cx', `${coordinates[0]}`],
      ['cy', `${coordinates[1]}`],
      ['stroke', `${color}`],
      ['fill', `${color}`],
      ['filter', `${SPRAY_URL}`],
    );
    this.drawElement(dot, properties);
    this.dotArray[this.subpathIndex++] = dot;
  }

  calculateSprayDotRadius(diameter: number): number {
    return (diameter / 2) * DOT_RADIUS_RATIO;
  }

}
