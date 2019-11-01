import { Injectable } from '@angular/core';

@Injectable()
export class PenGeneratorService {

    private readonly DEFAULT_WIDTH = 20;
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
        this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
        this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;
        this.time = this.date.getTime();
        this.speed = 0;
        this.addPath(mouseEvent, canvas, this.DEFAULT_WIDTH);
        this.mouseDown = true;
    }

    addPath(mouseEvent: MouseEvent, canvas: SVGElement, width: number): void {
        this.dotPositionX = mouseEvent.pageX - this.OFFSET_CANVAS_X;
        this.dotPositionY = mouseEvent.pageY - this.OFFSET_CANVAS_Y;
        canvas.innerHTML +=
            `<path id=\'penPath\'
          d=\'M ${(this.dotPositionX)} ${(this.dotPositionY)}
          L ${(this.dotPositionX)} ${(this.dotPositionY)}\'
          stroke=\'${this.color}\' stroke-width=\'${width}\' stroke-linecap=\'round\' fill=\'none\'></path>`;
    }

    updatePenPath(mouseEvent: MouseEvent, canvas: SVGElement, currentChildPosition: number) {
        if (this.mouseDown) {
            const currentPath = canvas.children[currentChildPosition - 1];
            if ((this.getSpeed(mouseEvent) - this.speed) > 0) {
                    // this.strokeWidth += 1;
                    // this.addPath(mouseEvent, canvas, this.strokeWidth);
                }
            if ((this.getSpeed(mouseEvent) - this.speed) < 0) {}
            if (currentPath != null) {
                currentPath.setAttribute('d',
                    currentPath.getAttribute('d') + ' L' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
                    ' ' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y));
            }
            this.speed = this.getSpeed(mouseEvent);
        }
    }

    finishPenPath() {
        if (this.mouseDown) {
            this.mouseDown = false;
        }
    }

    getSpeed(mouseEvent: MouseEvent): number {
        const currentDotPositionX = mouseEvent.pageX - this.OFFSET_CANVAS_X;
        const currentDotPositionY = mouseEvent.pageY - this.OFFSET_CANVAS_Y;
        const date = new Date();
        const time = date.getTime();
        const movementInX = Math.pow((currentDotPositionX - this.dotPositionX), 2);
        const movementInY = Math.pow((currentDotPositionY - this.dotPositionY), 2);
        let distance: number;
        if (movementInX > movementInY) {
            distance = Math.sqrt(movementInX - movementInY);
        } else { distance = Math.sqrt(movementInY - movementInX); }
        const timePassed = time - this.time;
        return (distance / timePassed);
    }

}
