const DEFAULT_MIN_WIDTH = 0.1;
const DEFAULT_MAX_WIDTH = 10;
const SPEED_ARRAY_SIZE = 10;
const K = 6;

import { Injectable } from '@angular/core';
import { AbstractWritingTool } from 'src/app/data-structures/abstract-writing-tool';
import { Action, ActionType } from 'src/app/data-structures/command';
import { RendererSingleton } from '../../renderer-singleton';
import { UndoRedoService } from '../../undo-redo/undo-redo.service';

@Injectable()
export class PenGeneratorService extends AbstractWritingTool {
    strokeWidthMinimum: number;
    strokeWidthMaximum: number;
    positionX: number;
    positionY: number;
    date = new Date();
    time: number;
    speed: number;
    color: string;
    currentPenPathNumber: number;
    pathArray: SVGElement[] = [];
    speedArray: number [] = new Array<number>(SPEED_ARRAY_SIZE);

    constructor(undoRedoService: UndoRedoService) {
        super(undoRedoService);
        this.strokeWidthMinimum = DEFAULT_MIN_WIDTH;
        this.strokeWidthMaximum = DEFAULT_MAX_WIDTH;
        this.currentPenPathNumber = 0;
    }

    createPenPath(mouseEvent: MouseEvent, primaryColor: string) {
        this.strokeWidth = this.strokeWidthMinimum;
        this.color = primaryColor;
        this.time = this.date.getTime();
        this.speed = 0;
        this.addPath(mouseEvent, this.DEFAULT_WIDTH);
        this.mouseDown = true;
    }

    addPath(mouseEvent: MouseEvent, width: number): void {
        this.OFFSET_CANVAS_Y = RendererSingleton.getCanvas().getBoundingClientRect().top;
        this.OFFSET_CANVAS_X = RendererSingleton.getCanvas().getBoundingClientRect().left;
        this.positionX = mouseEvent.pageX - this.OFFSET_CANVAS_X;
        this.positionY = mouseEvent.pageY - this.OFFSET_CANVAS_Y;

        const path = RendererSingleton.renderer.createElement('path', 'svg');
        const properties: [string, string][] = [];
        properties.push(
            ['id', `penPath${this.currentPenPathNumber}`],
            ['d', `M ${(this.positionX)} ${(this.positionY)}
        L ${(this.positionX)} ${(this.positionY)}`],
            ['stroke', `${this.color}`],
            ['stroke-width', `${width}`],
            ['stroke-linecap', `round`],
            ['fill', `${this.color}`],
        );
        this.drawElement(path, properties);
        this.pathArray.push(this.currentElement);
    }

    updatePenPath(mouseEvent: MouseEvent, canvas: SVGElement) {
        if (this.mouseDown) {
            const currentDotPositionX = mouseEvent.pageX - this.OFFSET_CANVAS_X;
            const currentDotPositionY = mouseEvent.pageY - this.OFFSET_CANVAS_Y;
            const date = new Date();
            const currentTime = date.getTime();
            const currentSpeed = this.getSpeed(currentTime, currentDotPositionX, currentDotPositionY);
            this.time = currentTime;
            this.positionX = currentDotPositionX;
            this.positionY = currentDotPositionY;
            const currentPath = canvas.children[canvas.childElementCount - 1];
            currentPath.setAttribute('d',
                currentPath.getAttribute('d') + ' L' + (mouseEvent.pageX - this.OFFSET_CANVAS_X) +
                ' ' + (mouseEvent.pageY - this.OFFSET_CANVAS_Y));
            this.updateStrokeWidth(currentSpeed);
            this.addPath(mouseEvent, this.strokeWidth);
            this.speed = currentSpeed;
        }
    }

    updateStrokeWidth(speed: number): void {
        this.strokeWidth = K / speed;
        if (this.strokeWidth < this.strokeWidthMinimum) {
            this.strokeWidth = this.strokeWidthMinimum;
        }
        if (this.strokeWidth > this.strokeWidthMaximum) {
            this.strokeWidth = this.strokeWidthMaximum;
        }
    }

    finishPenPath() {
        if (this.mouseDown) {
            this.currentPenPathNumber++;
            this.pushActions(this.pathArray);
            this.pathArray = [];
            this.mouseDown = false;
        }
    }

    getSpeed(currentTime: number, currentDotPositionX: number, currentDotPositionY: number): number {
        const movementInX = Math.pow((currentDotPositionX - this.positionX), 2);
        const movementInY = Math.pow((currentDotPositionY - this.positionY), 2);
        const distance = Math.sqrt(movementInX + movementInY);
        const timePassed = currentTime - this.time;
        const newSpeed = distance / timePassed;
        if (this.speedArray.length === SPEED_ARRAY_SIZE) {
            this.speedArray.shift();
            this.speedArray.push(newSpeed);
        } else {this.speedArray.push(newSpeed); }
        const speedAverage = (this.speedArray.reduce((a, b) => a + b, 0 )) / this.speedArray.length;
        return speedAverage;
    }

    pushActions(paths: SVGElement[]): void {

        const action: Action = {
            actionType: ActionType.Create,
            svgElements: paths,
            execute(): void {
                this.svgElements.forEach((path) => {
                    RendererSingleton.renderer.appendChild(RendererSingleton.getCanvas(), path);
                });
            },
            unexecute(): void {
                this.svgElements.forEach((path) => {
                    RendererSingleton.renderer.removeChild(RendererSingleton.getCanvas(), path);
                });
            },
        };

        this.undoRedoService.pushAction(action);
    }

}
