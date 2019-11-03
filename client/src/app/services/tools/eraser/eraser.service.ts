import { Injectable } from '@angular/core';
import { Action, ActionType } from 'src/app/data-structures/command';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { RendererSingleton } from '../../renderer-singleton';
import { UndoRedoService } from '../../undo-redo/undo-redo.service';
const DEFAULT_ERASER_SIZE = 10;
const ERASER_WARNING_DISTANCE = 50;

interface IEraseZone {
    left: number;
    top: number;
    bottom: number;
    right: number;
}

@Injectable()
export class EraserService {
    private OFFSET_CANVAS_X: number;
    private OFFSET_CANVAS_Y: number;
    private mouseDown: boolean;
    private eraseSize: number;
    private eraseZone: IEraseZone;
    private erasedDrawings: SVGElement[] = [];

    constructor(protected mousePosition: MousePositionService, protected undoRedoService: UndoRedoService) {
        this.mouseDown = false;
        this.eraseSize = DEFAULT_ERASER_SIZE;
    }

    set _eraserSize(size: number) {
        this.eraseSize = size;
    }

    startErasing(canvas: SVGElement): void {
        this.initialiseData(canvas);
        this.evaluateWhichDrawingsToErase(canvas);
        this.mouseDown = true;
    }

    initialiseData(canvas: SVGElement): void {
        this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
        this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;
        this.setEraseZone();
        this.setEraserSquare(canvas);
    }

    evaluateWhichDrawingsToErase(canvas: SVGElement): void {
        if (this.eraseZone != null) {
            const drawings = canvas.querySelectorAll('rect, path, ellipse, image, polyline, polygon');
            const drawingPile = new Array();
            drawings.forEach((drawing) => {
                this.warnBeforeErasing(drawing);

                if ((this.intersects(drawing as SVGGElement) && (drawing.id !== 'selector')
                    && (drawing.id !== 'backgroundGrid') && (drawing.id !== '') && (drawing.id !== 'eraser'))) {
                    drawingPile.push(drawing);
                }
            });
            for (let i = canvas.children.length - 1; i > 0; i--) {
                const index = drawingPile.indexOf(canvas.children[i]);
                if (index !== -1) {
                    this.erase(canvas, drawingPile[index]);
                    return;
                }
            }
        }
    }

    warnBeforeErasing(drawing: Element): void {
        if ((this.isCloseToIntersecting(drawing as SVGGElement) && (drawing.id !== 'selector')
            && (drawing.id !== 'backgroundGrid') && (drawing.id !== '') && (drawing.id !== 'eraser'))) {
            if (drawing.tagName === 'image') {
                // TODO
            } else { drawing.setAttribute('stroke', 'red'); }

        } else { drawing.setAttribute('stroke', 'black'); } // TODO remplacer par couleur initiale

    }

    erase(canvas: SVGElement, drawing: SVGGElement): void {
        if (drawing.id.substring(0, 7) === 'penPath') {
            const paths = canvas.querySelectorAll('path');
            paths.forEach((path) => {
                if (path.id === drawing.id) {
                    this.erasedDrawings.push(path);
                    canvas.removeChild(path);
                }
            });
        } else {
            this.erasedDrawings.push(drawing);
            canvas.removeChild(drawing); }
    }

    moveEraser(canvas: SVGElement): void {
        if (this.mouseDown) {
            this.setEraseZone();
            this.setEraserSquare(canvas);
            const eraser = canvas.querySelector('#eraser') as SVGElement;
            canvas.removeChild(eraser);
            this.evaluateWhichDrawingsToErase(canvas);
        }
    }

    stopErasing(canvas: SVGElement): void {
        if (this.mouseDown) {
            const eraser = canvas.querySelector('#eraser') as SVGElement;
            canvas.removeChild(eraser);
            this.pushAction();
            this.erasedDrawings = [];
            this.mouseDown = false;
        }
    }

    isCloseToIntersecting(drawing: SVGGElement): boolean {
        const drawingZone = drawing.getBoundingClientRect();
        const drawingRightSide = drawingZone.right - this.OFFSET_CANVAS_X;
        const drawingLeftSide = drawingZone.left - this.OFFSET_CANVAS_X;
        const drawingTop = drawingZone.top - this.OFFSET_CANVAS_Y;
        const drawingBottom = drawingZone.bottom - this.OFFSET_CANVAS_Y;

        const isAlmostTouchingRightSide: boolean =
            ((this.eraseZone.left - drawingRightSide <= ERASER_WARNING_DISTANCE) && (this.eraseZone.left - drawingRightSide > 0) &&
                ((drawingTop - this.eraseZone.bottom <= ERASER_WARNING_DISTANCE) &&
                    (this.eraseZone.top - drawingBottom <= ERASER_WARNING_DISTANCE)));

        const isAlmostTouchingLeftSide: boolean =
            ((drawingLeftSide - this.eraseZone.right <= ERASER_WARNING_DISTANCE) && (drawingLeftSide - this.eraseZone.right > 0) &&
                ((drawingTop - this.eraseZone.bottom <= ERASER_WARNING_DISTANCE) &&
                    (this.eraseZone.top - drawingBottom <= ERASER_WARNING_DISTANCE)));

        const isAlmostTouchingTop: boolean =
            ((drawingTop - this.eraseZone.bottom <= ERASER_WARNING_DISTANCE) && (drawingTop - this.eraseZone.bottom > 0) &&
                ((drawingLeftSide - this.eraseZone.right <= ERASER_WARNING_DISTANCE) &&
                    (this.eraseZone.left - drawingRightSide <= ERASER_WARNING_DISTANCE)));

        const isAlmostTouchingBottom: boolean =
            ((this.eraseZone.top - drawingBottom <= ERASER_WARNING_DISTANCE) && (this.eraseZone.top - drawingBottom > 0) &&
                ((drawingLeftSide - this.eraseZone.right <= ERASER_WARNING_DISTANCE) &&
                    (this.eraseZone.left - drawingRightSide <= ERASER_WARNING_DISTANCE)));

        return (isAlmostTouchingLeftSide || isAlmostTouchingRightSide || isAlmostTouchingTop || isAlmostTouchingBottom);

    }

    intersects(drawing: SVGGElement): boolean {
        const drawingZone = drawing.getBoundingClientRect();
        const isEraserTouchingTheDrawing = !((this.eraseZone.left > drawingZone.right - this.OFFSET_CANVAS_X ||
            drawingZone.left - this.OFFSET_CANVAS_X > this.eraseZone.right) ||
            (this.eraseZone.top > drawingZone.bottom - this.OFFSET_CANVAS_Y ||
                drawingZone.top - this.OFFSET_CANVAS_Y > this.eraseZone.bottom));

        return isEraserTouchingTheDrawing;
    }

    setEraseZone(): void {
        this.eraseZone = {
            left: this.mousePosition._canvasMousePositionX - (this.eraseSize / 2),
            top: this.mousePosition._canvasMousePositionY - (this.eraseSize / 2),
            bottom: this.mousePosition._canvasMousePositionY + (this.eraseSize / 2),
            right: this.mousePosition._canvasMousePositionX + (this.eraseSize / 2),
        };
    }

    setEraserSquare(canvas: SVGElement): void {
        canvas.innerHTML +=
            `<rect id="eraser"
        x="${(this.eraseZone.left)}"
        y="${(this.eraseZone.top)}"
        width="${(this.eraseSize)}" height="${(this.eraseSize)}" stroke="black"
        fill="transparent"></rect>`;
    }

    pushAction(): void {
        const action: Action = {
            actionType: ActionType.Create,
            svgElements: this.erasedDrawings,
            execute(): void {
                this.svgElements.forEach((drawing) => {
                    RendererSingleton.renderer.removeChild(RendererSingleton.getCanvas(), drawing);
                });
            },
            unexecute(): void {
                this.svgElements.forEach((drawing) => {
                    RendererSingleton.renderer.appendChild(RendererSingleton.getCanvas(), drawing);
                });
            },
        };
        this.undoRedoService.pushAction(action);
    }
}
