import {Injectable} from '@angular/core';

const DASHED_LINE_VALUE = 5;

@Injectable()
export class ObjectSelectorService {

    private OFFSET_CANVAS_Y: number;
    private OFFSET_CANVAS_X: number;
    private currentRectNumber: number;
   // private mouseDown: boolean;

    createSelectorRectangle(mouseEvent: MouseEvent, canvas: HTMLElement) {

        this.OFFSET_CANVAS_Y = canvas.getBoundingClientRect().top;
        this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;

        canvas.innerHTML +=
            `<rect id=\'rect${this.currentRectNumber}\'
            x=\'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
            data-start-x = \'${(mouseEvent.pageX - this.OFFSET_CANVAS_X)}\'
            y=\'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
            data-start-y = \'${(mouseEvent.pageY - this.OFFSET_CANVAS_Y)}\'
            width = \'0\' height = \'0\' stroke-dasharray = \'${DASHED_LINE_VALUE}\'
            fill=\'transparent\'></rect>`;

      //  this.mouseDown = true;
      }
}
