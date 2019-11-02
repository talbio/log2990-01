const DEFAULT_WIDTH = 20;
const MIN_WIDTH = 2;
const MAX_WIDTH = 40;

import { Injectable } from '@angular/core';

@Injectable()
export class PenGeneratorService {
    private strokeWidth: number;
    private strokeWidthMinimum: number;
    private strokeWidthMaximum: number;
    private OFFSET_CANVAS_X: number;
    private OFFSET_CANVAS_Y: number;
    private mouseDown = false;
    private dotPositionX: number;
    private dotPositionY: number;
    private date = new Date();
    private time: number;
    private speed: number;
    private color: string;
    private currentPenPathNumber: number;

    constructor() {
        this.strokeWidthMinimum = MIN_WIDTH;
        this.strokeWidthMaximum = MAX_WIDTH;
        this.currentPenPathNumber = 0;
      }

      set _strokeWidthMinimum(width: number) {
          this.strokeWidthMinimum = width;
      }

      get _strokeWidthMinimum(): number {
        return this.strokeWidthMinimum;
    }

      set _strokeWidthMaximum(width: number) {
        this.strokeWidthMaximum = width;
    }

    get _strokeWidthMaximum(): number {
        return this.strokeWidthMaximum;
    }

    createPenPath(mouseEvent: MouseEvent, canvas: SVGElement, primaryColor: string) {
        this.strokeWidth = DEFAULT_WIDTH;
        this.color = primaryColor;
        this.time = this.date.getTime();
        this.speed = 0;
        this.addPath(mouseEvent, canvas, DEFAULT_WIDTH);
        this.mouseDown = true;
    }

    addPath(mouseEvent: MouseEvent, canvas: SVGElement, width: number): void {
        this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
        this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;
        this.dotPositionX = mouseEvent.pageX - this.OFFSET_CANVAS_X;
        this.dotPositionY = mouseEvent.pageY - this.OFFSET_CANVAS_Y;
        canvas.innerHTML +=
            `<path id="pencilPath${this.currentPenPathNumber}}"
        d="M ${(this.dotPositionX)} ${(this.dotPositionY)}
        L ${(this.dotPositionX)} ${(this.dotPositionY)}"
        stroke="${this.color}" stroke-width="${width}" stroke-linecap="round" fill="${this.color}"></path>`;

    }

    updatePenPath(mouseEvent: MouseEvent, canvas: SVGElement) {
        if (this.mouseDown) {
            const currentDotPositionX = mouseEvent.pageX - this.OFFSET_CANVAS_X;
            const currentDotPositionY = mouseEvent.pageY - this.OFFSET_CANVAS_Y;
            const date = new Date();
            const time = date.getTime();
            const currentSpeed = this.getSpeed(time, currentDotPositionX, currentDotPositionY);
            this.updateTimeAndPosition(time, currentDotPositionX, currentDotPositionY);
            const currentPath = canvas.children[canvas.childElementCount - 1];
            currentPath.setAttribute('d',
                    currentPath.getAttribute('d') + ' L' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
                    ' ' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y));
            this.updateStrokeWidth(currentSpeed);
            this.addPath(mouseEvent, canvas, this.strokeWidth);
            this.speed = currentSpeed;
        }
    }

    updateStrokeWidth(currentSpeed: number): void {
        if ((currentSpeed - this.speed) > 0) {
            if (this.strokeWidth > this.strokeWidthMinimum) {
                this.strokeWidth -= 2;
            }
        }
        if ((currentSpeed - this.speed) < 0) {
            if (this.strokeWidth < this.strokeWidthMaximum) {
                this.strokeWidth += 2;
            }
        }
    }

    finishPenPath() {
        if (this.mouseDown) {
            this.currentPenPathNumber += 1;
            this.mouseDown = false;
        }
    }

    getSpeed(currentTime: number, currentDotPositionX: number, currentDotPositionY: number): number {
        const movementInX = Math.pow((currentDotPositionX - this.dotPositionX), 2);
        const movementInY = Math.pow((currentDotPositionY - this.dotPositionY), 2);
        const distance = Math.sqrt(movementInX + movementInY);
        const timePassed = currentTime - this.time;
        return (distance / timePassed);
    }

    updateTimeAndPosition(time: number, currentDotPositionX: number, currentDotPositionY: number): void {
        this.time = time;
        this.dotPositionX = currentDotPositionX;
        this.dotPositionY = currentDotPositionY;
    }

}
