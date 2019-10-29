import { Injectable } from '@angular/core';
import { MousePositionService } from '../../mouse-position/mouse-position.service';

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

    constructor(protected mousePosition: MousePositionService) {
        this.mouseDown = false;
        this.eraseSize = 10;
    }

    startErasing(canvas: SVGElement): void {

        this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
        this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;
        this.setEraseZone();
        this.removeDrawings(canvas);
        this.mouseDown = true;
    }

    removeDrawings(canvas: SVGElement): void {
        if (this.eraseZone != null) {
            const drawings = canvas.querySelectorAll('rect, path, ellipse, image, polyline, polygon');
            const drawingPile = new Array();
            drawings.forEach((drawing) => {
                if ((this.intersects(drawing as SVGGElement) && (drawing.id !== 'selector')
                    && (drawing.id !== 'backgroundGrid') && (drawing.id !== '') && (drawing.id !== 'eraser'))) {
                    drawingPile.push(drawing);
                }
            });
            for (let i = canvas.children.length - 1; i > 0; i--) {
                const index = drawingPile.indexOf(canvas.children[i]);
                if (index !== -1) {
                    canvas.removeChild(drawingPile[index]);
                    return;
                }
            }
        }
    }
    moveEraser(canvas: SVGElement): void {
        if (this.mouseDown) {
            this.removeDrawings(canvas);
            this.setEraseZone();
        }
    }

    stopErasing(canvas: SVGElement): void {
        if (this.mouseDown) {
           // const eraser = canvas.querySelector('#eraser') as SVGElement;
           // canvas.removeChild(eraser);
            this.mouseDown = false;
        }
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

    setEraserSquare(): void {
        // TODO
        // canvas.innerHTML +=
        // `<rect id="eraser"
        // x="${(this.eraseZone.left)}"
        // y="${(this.eraseZone.top)}"
        // width="${(this.eraseSize)}" height="${(this.eraseSize)}" stroke="black"
        // fill="transparent"></rect>`;
    }
}
