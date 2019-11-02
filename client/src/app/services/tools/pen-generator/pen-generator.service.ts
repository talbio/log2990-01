import { Injectable } from '@angular/core';

@Injectable()
export class PenGeneratorService {

    private readonly DEFAULT_WIDTH = 30;
    strokeWidth: number;
    private OFFSET_CANVAS_X: number;
    private OFFSET_CANVAS_Y: number;
    private mouseDown = false;
    private dotPositionX: number;
    private dotPositionY: number;
    private date = new Date();
    private time: number;
    private speed: number;
    private color: string;

    createPenPath(mouseEvent: MouseEvent, canvas: SVGElement, primaryColor: string) {
        this.strokeWidth = this.DEFAULT_WIDTH;
        this.color = primaryColor;
        this.time = this.date.getTime();
        this.speed = 0;
        this.addPath(mouseEvent, canvas, this.DEFAULT_WIDTH);
        this.mouseDown = true;
    }

    addPath(mouseEvent: MouseEvent, canvas: SVGElement, width: number): void {
        this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
        this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;
        this.dotPositionX = mouseEvent.pageX - this.OFFSET_CANVAS_X;
        this.dotPositionY = mouseEvent.pageY - this.OFFSET_CANVAS_Y;
        canvas.innerHTML +=
            `<path id="pencilPath}"
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
            if (this.strokeWidth > 1) {
                this.strokeWidth -= 2;
            }
        }
        if ((currentSpeed - this.speed) < 0) {
            if (this.strokeWidth < 20) {
                this.strokeWidth += 2;
            }
        }
    }

    finishPenPath() {
        if (this.mouseDown) {
            this.mouseDown = false;
        }
    }

    getSpeed(time: number, currentDotPositionX: number, currentDotPositionY: number): number {
        const movementInX = Math.pow((currentDotPositionX - this.dotPositionX), 2);
        const movementInY = Math.pow((currentDotPositionY - this.dotPositionY), 2);
        const distance = Math.sqrt(movementInX + movementInY);
        const timePassed = time - this.time;
        return (distance / timePassed);
    }

    updateTimeAndPosition(time: number, currentDotPositionX: number, currentDotPositionY: number): void {
        this.time = time;
        this.dotPositionX = currentDotPositionX;
        this.dotPositionY = currentDotPositionY;
    }

}
