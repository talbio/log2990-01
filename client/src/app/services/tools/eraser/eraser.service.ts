import { Injectable } from '@angular/core';
import { Command } from '../../../data-structures/command';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { RendererSingleton } from '../../renderer-singleton';
import { UndoRedoService } from '../../undo-redo/undo-redo.service';
const DEFAULT_ERASER_SIZE = 10;
const ERASER_WARNING_DISTANCE = 50;
const svgTypesNotToBeErased: string[] = ['eraser', 'backgroundGrid', 'selector', ''];
interface IEraseZone {
    left: number;
    top: number;
    bottom: number;
    right: number;
}

@Injectable()
export class EraserService {
    OFFSET_CANVAS_X: number;
    OFFSET_CANVAS_Y: number;
    mouseDown: boolean;
    eraseSize: number;
    eraseZone: IEraseZone;
    erasedDrawings: SVGElement[] = [];

    constructor(protected mousePosition: MousePositionService,
                protected undoRedoService: UndoRedoService) {
        this.mouseDown = false;
        this.eraseSize = DEFAULT_ERASER_SIZE;
    }

    set _eraseSize(width: number) { this.eraseSize = width; }

    startErasing(): void {
        this.initialiseData();
        this.evaluateWhichDrawingsToErase();
        this.mouseDown = true;
    }

    initialiseData(): void {
        this.OFFSET_CANVAS_Y = RendererSingleton.canvas.getBoundingClientRect().top;
        this.OFFSET_CANVAS_X = RendererSingleton.canvas.getBoundingClientRect().left;
        this.setEraseZone();
        this.setEraserSquare();
    }

    evaluateWhichDrawingsToErase(): void {
        if (this.eraseZone != null) {
            const drawings = RendererSingleton.canvas.querySelectorAll('rect, path, ellipse, image, polyline, polygon');
            const drawingPile = new Array();
            drawings.forEach((drawing) => {
                this.warnBeforeErasing(drawing as SVGElement);
                const drawingZone = drawing.getBoundingClientRect();
                if ((this.intersects(drawingZone as DOMRect)) && (!svgTypesNotToBeErased.includes(drawing.id))) {
                    drawingPile.push(drawing);
                }
            });
            for (let i = RendererSingleton.canvas.children.length - 1; i > 0; i--) {
                const index = drawingPile.indexOf(RendererSingleton.canvas.children[i]);
                if (index !== -1) {
                    this.erase(drawingPile[index]);
                    return;
                }
            }
        }
    }

    warnBeforeErasing(drawing: SVGElement): void {
        const drawingZone = drawing.getBoundingClientRect();
        if ((this.isCloseToIntersecting(drawingZone as DOMRect) && (!svgTypesNotToBeErased.includes(drawing.id)))) {
            drawing.setAttribute('filter', 'url(#dropshadow)');
        } else {
            drawing.setAttribute('filter', '');
        }
    }

    erase(drawing: SVGGElement): void {
        if (drawing.id.startsWith('penPath')) {
            const paths = RendererSingleton.canvas.querySelectorAll('path');
            paths.forEach((path) => {
                if (path.id === drawing.id) {
                    path.setAttribute('filter', '');
                    this.erasedDrawings.push(path);
                    RendererSingleton.canvas.removeChild(path);
                }
            });
        } else {
            this.erasedDrawings.push(drawing);
            RendererSingleton.canvas.removeChild(drawing);
        }
    }

    moveEraser(): void {
        if (this.mouseDown) {
            this.setEraseZone();
            this.setEraserSquare();
            const eraser = RendererSingleton.canvas.querySelector('#eraser') as SVGElement;
            RendererSingleton.canvas.removeChild(eraser);
            this.evaluateWhichDrawingsToErase();
        }
    }

    stopErasing(): void {
        if (this.mouseDown) {
            const eraser = RendererSingleton.canvas.querySelector('#eraser') as SVGElement;
            RendererSingleton.canvas.removeChild(eraser);
            this.pushAction(this.erasedDrawings);
            this.erasedDrawings = [];
            this.mouseDown = false;
        }
    }

    isCloseToIntersecting(drawingZone: DOMRect): boolean {
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

    intersects(drawingZone: DOMRect): boolean {
        const isEraserTouchingTheDrawing = !((this.eraseZone.left > drawingZone.right - this.OFFSET_CANVAS_X ||
            drawingZone.left - this.OFFSET_CANVAS_X > this.eraseZone.right) ||
            (this.eraseZone.top > drawingZone.bottom - this.OFFSET_CANVAS_Y ||
                drawingZone.top - this.OFFSET_CANVAS_Y > this.eraseZone.bottom));

        return isEraserTouchingTheDrawing;
    }

    setEraseZone(): void {
        this.eraseZone = {
            left: this.mousePosition.canvasMousePositionX - (this.eraseSize / 2),
            top: this.mousePosition.canvasMousePositionY - (this.eraseSize / 2),
            bottom: this.mousePosition.canvasMousePositionY + (this.eraseSize / 2),
            right: this.mousePosition.canvasMousePositionX + (this.eraseSize / 2),
        };
    }

    setEraserSquare(): void {
        const eraser = RendererSingleton.renderer.createElement('rect', 'svg');
        RendererSingleton.renderer.setAttribute(eraser, 'id', 'eraser');
        RendererSingleton.renderer.setAttribute(eraser, 'x',
            (this.mousePosition.canvasMousePositionX - this.eraseSize / 2) as unknown as string);
        RendererSingleton.renderer.setAttribute(eraser, 'y',
            (this.mousePosition.canvasMousePositionY - this.eraseSize / 2) as unknown as string);
        RendererSingleton.renderer.setAttribute(eraser, 'width', this.eraseSize as unknown as string);
        RendererSingleton.renderer.setAttribute(eraser, 'height', this.eraseSize as unknown as string);
        RendererSingleton.renderer.setAttribute(eraser, 'stroke', 'black');
        RendererSingleton.renderer.setAttribute(eraser, 'fill', 'transparent');
        RendererSingleton.renderer.appendChild(RendererSingleton.canvas, eraser);
    }

    pushAction(drawings: SVGElement[]): void {
        const command: Command = {
            execute(): void {
                drawings.forEach((drawing) => {
                    RendererSingleton.renderer.removeChild(RendererSingleton.canvas, drawing);
                });
            },
            unexecute(): void {
                drawings.forEach((drawing) => {
                    RendererSingleton.renderer.appendChild(RendererSingleton.canvas, drawing);
                });
            },
        };
        this.undoRedoService.pushCommand(command);
    }
}
