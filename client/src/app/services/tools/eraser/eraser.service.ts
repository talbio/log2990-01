import { Injectable } from '@angular/core';
import { Action, ActionType } from 'src/app/data-structures/command';
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
    strokeColors = new Map<string, string>();
    isPenCloseToBeingErased: boolean;

    constructor(protected mousePosition: MousePositionService, protected undoRedoService: UndoRedoService) {
        this.mouseDown = false;
        this.eraseSize = DEFAULT_ERASER_SIZE;
        this.isPenCloseToBeingErased = false;
    }

    set _eraseSize(width: number) { this.eraseSize = width; }

    startErasing(): void {
        this.initialiseData();
        this.evaluateWhichDrawingsToErase();
        this.mouseDown = true;
    }

    initialiseData(): void {
        this.OFFSET_CANVAS_Y = RendererSingleton.getCanvas().getBoundingClientRect().top;
        this.OFFSET_CANVAS_X = RendererSingleton.getCanvas().getBoundingClientRect().left;
        this.setEraseZone();
        this.setEraserSquare();
    }

    evaluateWhichDrawingsToErase(): void {
        if (this.eraseZone != null) {
            const drawings = RendererSingleton.getCanvas().querySelectorAll('rect, path, ellipse, image, polyline, polygon');
            const drawingPile = new Array();
            drawings.forEach((drawing) => {
                this.warnBeforeErasing(drawing);
                const drawingZone = drawing.getBoundingClientRect();
                if ((this.intersects(drawingZone as DOMRect)) && (!svgTypesNotToBeErased.includes(drawing.id))) {
                    drawingPile.push(drawing);
                }
            });
            for (let i = RendererSingleton.getCanvas().children.length - 1; i > 0; i--) {
                const index = drawingPile.indexOf(RendererSingleton.getCanvas().children[i]);
                if (index !== -1) {
                    this.erase(drawingPile[index]);
                    return;
                }
            }
        }
    }

    warnBeforeErasing(drawing: Element): void {
        const drawingZone = drawing.getBoundingClientRect();

        if ((this.isCloseToIntersecting(drawingZone as DOMRect) && (!svgTypesNotToBeErased.includes(drawing.id)))) {
            if (drawing.tagName === 'image') {
                    drawing.setAttribute('filter', 'url(#dropshadow)');
            } else {
                if (this.strokeColors.get(drawing.id) === undefined) {
                    this.strokeColors.set(drawing.id, drawing.getAttribute('stroke') as string);
                }
                if (drawing.id.substring(0, 7) === 'penPath') {
                    this.isPenCloseToBeingErased = true;
                   // const children = RendererSingleton.getCanvas().childNodes;
                    // TODO: gerer couleur pen path
                }
                drawing.setAttribute('stroke', 'red');
            }

        } else {
            if ((this.strokeColors.get(drawing.id) !== undefined) && !this.isPenCloseToBeingErased) {
                drawing.setAttribute('stroke', this.strokeColors.get(drawing.id) as string);
            }
            if (drawing.tagName === 'image') {
                    drawing.setAttribute('filter', '');
                }
            }
        }

    erase(drawing: SVGGElement): void {
        if (drawing.id.substring(0, 7) === 'penPath') {
            const paths = RendererSingleton.getCanvas().querySelectorAll('path');
            paths.forEach((path) => {
                if (path.id === drawing.id) {
                    this.erasedDrawings.push(path);
                    RendererSingleton.getCanvas().removeChild(path);
                }
            });
        } else {
            this.erasedDrawings.push(drawing);
            RendererSingleton.getCanvas().removeChild(drawing);
        }
    }

    moveEraser(): void {
        if (this.mouseDown) {
            this.setEraseZone();
            this.setEraserSquare();
            const eraser = RendererSingleton.getCanvas().querySelector('#eraser') as SVGElement;
            RendererSingleton.getCanvas().removeChild(eraser);
            this.evaluateWhichDrawingsToErase();
        }
    }

    stopErasing(): void {
        if (this.mouseDown) {
            const eraser = RendererSingleton.getCanvas().querySelector('#eraser') as SVGElement;
            RendererSingleton.getCanvas().removeChild(eraser);
            this.pushAction();
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
            left: this.mousePosition._canvasMousePositionX - (this.eraseSize / 2),
            top: this.mousePosition._canvasMousePositionY - (this.eraseSize / 2),
            bottom: this.mousePosition._canvasMousePositionY + (this.eraseSize / 2),
            right: this.mousePosition._canvasMousePositionX + (this.eraseSize / 2),
        };
    }

    setEraserSquare(): void {
        RendererSingleton.getCanvas().innerHTML +=
            `<rect id="eraser"
        x="${(this.mousePosition._canvasMousePositionX - this.eraseSize / 2)}"
        y="${(this.mousePosition._canvasMousePositionY - this.eraseSize / 2)}"
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
