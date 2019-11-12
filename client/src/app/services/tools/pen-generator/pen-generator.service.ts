import {MousePositionService} from '../../mouse-position/mouse-position.service';

const DEFAULT_MIN_WIDTH = 0.1;
const DEFAULT_MAX_WIDTH = 15;
const SPEED_ARRAY_SIZE = 10;
const SPEED_CONSTANT = 6;
const MIN_TIME_PASSED = 0.001;

import { Injectable } from '@angular/core';
import { AbstractWritingTool } from '../../../data-structures/abstract-writing-tool';
import { RendererSingleton } from '../../renderer-singleton';
import { UndoRedoService } from '../../undo-redo/undo-redo.service';

@Injectable()
export class PenGeneratorService extends AbstractWritingTool {
  strokeWidthMinimum: number;
  strokeWidthMaximum: number;
  positionX: number;
  positionY: number;
  date: Date;
  time: number;
  speed: number;
  color: string;
  pathArray: SVGElement[];
  speedArray: number [];

  constructor(protected undoRedoService: UndoRedoService,
              protected mouse: MousePositionService) {
      super(mouse, undoRedoService);
      this.strokeWidthMinimum = DEFAULT_MIN_WIDTH;
      this.strokeWidthMaximum = DEFAULT_MAX_WIDTH;
      this.date = new Date();
      this.pathArray = [];
      this.speedArray = new Array<number>(SPEED_ARRAY_SIZE);
      this.positionX = this.xPos;
      this.positionY = this.yPos;
  }

  createElement(primaryColor: string) {
      this.strokeWidth = this.strokeWidthMinimum;
      this.color = primaryColor;
      this.time = this.date.getTime();
      this.speed = 0;
      this.addPath(this.DEFAULT_WIDTH);
      this.mouseDown = true;
  }

  addPath(width: number): void {
      const path = RendererSingleton.renderer.createElement('path', 'svg');
      const properties: [string, string][] = [];
      properties.push(
          ['id', `penPath${this.currentElementsNumber}`],
          ['d', `M ${(this.xPos)} ${(this.yPos)} L ${(this.xPos)} ${(this.yPos)}`],
          ['stroke', `${this.color}`],
          ['stroke-width', `${width}`],
          ['stroke-linecap', `round`],
          ['fill', `${this.color}`],
      );
      this.drawElement(path, properties);
      this.pathArray.push(this.currentElement);
  }

  updateElement() {
      if (this.mouseDown) {
          const currentPositionX = this.xPos;
          const currentPositionY = this.yPos;
          const date = new Date();
          const currentTime = date.getTime();
          const currentSpeed = this.getSpeed(currentTime, currentPositionX, currentPositionY);
          const adjustedSpeed = this.adjustSpeed(currentSpeed);
          this.time = currentTime;
          this.updatePosition(currentPositionX, currentPositionY);
          const currentPath = RendererSingleton.canvas.children[RendererSingleton.canvas.childElementCount - 1];
          currentPath.setAttribute(
            'd', currentPath.getAttribute('d') + ' L' + this.xPos + ' ' + this.yPos);
          this.updateStrokeWidth(adjustedSpeed);
          this.addPath(this.strokeWidth);
          this.speed = currentSpeed;
      }
  }

  updatePosition(currentPositionX: number, currentPositionY: number) {
      this.positionX = currentPositionX;
      this.positionY = currentPositionY;
  }

  updateStrokeWidth(speed: number): void {
      this.strokeWidth = SPEED_CONSTANT / speed;
      if (this.strokeWidth < this.strokeWidthMinimum) {
          this.strokeWidth = this.strokeWidthMinimum;
      }
      if (this.strokeWidth > this.strokeWidthMaximum) {
          this.strokeWidth = this.strokeWidthMaximum;
      }
  }

  finishElement(): void {
      if (this.mouseDown) {
          this.currentElementsNumber += 1;
          this.pushGeneratorCommand(...this.pathArray);
          this.pathArray = [];
          this.speedArray = [];
          this.mouseDown = false;
      }
  }

  getSpeed(currentTime: number, currentPositionX: number, currentPositionY: number): number {
      const movementInX = Math.pow((currentPositionX - this.positionX), 2);
      const movementInY = Math.pow((currentPositionY - this.positionY), 2);
      const distance = Math.sqrt(movementInX + movementInY);
      let timePassed = currentTime - this.time;
      if (timePassed === 0) {timePassed = MIN_TIME_PASSED; }
      return distance / timePassed;
  }

  adjustSpeed(newSpeed: number) {
      // adds the current speed to an array of recent speeds and returns average for smoother results
      if (this.speedArray.length === SPEED_ARRAY_SIZE) {
          this.speedArray.shift();
          this.speedArray.push(newSpeed);
      } else {this.speedArray.push(newSpeed); }
      const adjustedSpeed = ((this.speedArray.reduce((a, b) => a + b, 0 )) / this.speedArray.length);
      return adjustedSpeed;
  }
}
