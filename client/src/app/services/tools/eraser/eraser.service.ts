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
    private isMouseDown: boolean;
    private eraseSize: number;

    constructor(protected mousePosition: MousePositionService) {
        this.isMouseDown = false;
        this.eraseSize = 10;
    }

    private eraseZone: IEraseZone;

    startErasing(mouseEvent: MouseEvent, canvas: SVGElement): void {

        this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
        this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

        this.eraseZone = {
            left: mouseEvent.pageX - this.OFFSET_CANVAS_X - (this.eraseSize / 2),
            top: mouseEvent.pageY - this.OFFSET_CANVAS_Y - (this.eraseSize / 2),
            bottom: mouseEvent.pageY - this.OFFSET_CANVAS_Y + (this.eraseSize / 2),
            right: mouseEvent.pageX - this.OFFSET_CANVAS_X  + (this.eraseSize / 2),
        };
        const drawings = canvas.querySelectorAll('image');
        drawings.forEach((drawing) => {
            if ((this.intersects(drawing as SVGGElement) && (drawing.id !== 'selector')
                && (drawing.id !== 'backgroundGrid') && (drawing.id !== ''))) {
                canvas.removeChild(drawing);
            }
        });
    }

    erase(canvas: SVGElement): void {
        console.log("erasing")
        if (this.isMouseDown) {
        //     if (this.eraseZone != null) {
        //         const drawings = canvas.querySelectorAll('rect, path, ellipse, image, polyline, polygon');
        //         drawings.forEach((drawing) => {
        //             if ((this.intersects(drawing as SVGGElement) && (drawing.id !== 'selector')
        //                 && (drawing.id !== 'backgroundGrid') && (drawing.id !== ''))) {
        //                 canvas.removeChild(drawing);
        //             }
        //         });
        //     }
         }
    }

    intersects(drawing: SVGGElement): boolean {
        const drawingZone = drawing.getBoundingClientRect();
        return !((this.eraseZone.left > drawingZone.right - this.OFFSET_CANVAS_X ||
            drawingZone.left - this.OFFSET_CANVAS_X > this.eraseZone.right) ||
            (this.eraseZone.top > drawingZone.bottom - this.OFFSET_CANVAS_Y ||
                drawingZone.top - this.OFFSET_CANVAS_Y > this.eraseZone.bottom));
    }

}
