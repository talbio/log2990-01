import { MousePositionService } from './../../mouse-position/mouse-position.service';
const DEFAULT_WIDTH = 20;
const MIN_WIDTH = 2;
const MAX_WIDTH = 40;

import { Injectable } from '@angular/core';
import { AbstractWritingTool } from '../../../data-structures/abstract-writing-tool';
import { Action, ActionType } from '../../../data-structures/command';
import { RendererSingleton } from '../../renderer-singleton';
import { UndoRedoService } from '../../undo-redo/undo-redo.service';

@Injectable()
export class PenGeneratorService extends AbstractWritingTool {
    strokeWidth: number;
    strokeWidthMinimum: number;
    strokeWidthMaximum: number;
    mouseDown = false;
    private dotPositionX: number;
    private dotPositionY: number;
    private date = new Date();
    private time: number;
    private speed: number;
    private color: string;
    private currentPenPathNumber: number;
    private pathArray: SVGElement[] = [];

    constructor(protected mouse: MousePositionService,
                protected undoRedoService: UndoRedoService) {
        super(mouse, undoRedoService);
        this.strokeWidthMinimum = MIN_WIDTH;
        this.strokeWidthMaximum = MAX_WIDTH;
        this.currentPenPathNumber = 0;
    }

    createPenPath(primaryColor: string) {
        this.strokeWidth = DEFAULT_WIDTH;
        this.color = primaryColor;
        this.time = this.date.getTime();
        this.speed = 0;
        this.addPath(DEFAULT_WIDTH);
        this.mouseDown = true;
    }

    addPath(width: number): void {
        this.dotPositionX = this.mouse.canvasMousePositionX;
        this.dotPositionY = this.mouse.canvasMousePositionY;

        const path = RendererSingleton.renderer.createElement('path', 'svg');
        const properties: [string, string][] = [];
        properties.push(
            ['id', `pencilPath${this.currentPenPathNumber}`],
            ['d', `M ${(this.dotPositionX)} ${(this.dotPositionY)}
        L ${(this.dotPositionX)} ${(this.dotPositionY)}`],
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
            const date = new Date();
            const time = date.getTime();
            const currentSpeed = this.getSpeed(time, this.mouse.canvasMousePositionX, this.mouse.canvasMousePositionY);
            this.updateTimeAndPosition(time, this.mouse.canvasMousePositionX, this.mouse.canvasMousePositionY);
            const currentPath = canvas.children[canvas.childElementCount - 1];
            currentPath.setAttribute('d',
                currentPath.getAttribute('d') + ' L' + (this.mouse.canvasMousePositionX) +
                ' ' + (this.mouse.canvasMousePositionY));
            this.updateStrokeWidth(currentSpeed);
            this.addPath(this.strokeWidth);
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
            this.pushActions(this.pathArray);
            this.pathArray = [];
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
