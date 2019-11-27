import { Injectable } from '@angular/core';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { RendererSingleton } from '../../renderer-singleton';
import { GridTogglerService } from '../grid/grid-toggler.service';

@Injectable()
export class MagnetismGeneratorService {
    movementMap: Map<string, boolean> = new Map();
    private readonly BOUNDING_RECT_ID = 'boundingRect';

    constructor(private grid: GridTogglerService,
                private mousePosition: MousePositionService) {
    this.movementMap.set('left', false);
    this.movementMap.set('right', false);
    this.movementMap.set('up', false);
    this.movementMap.set('down', false);
    }

      getTranslationWithMagnetismValue(): number[] {
        const vertical =
        this.grid.getClosestVerticalLine(this.movementMap.get('left') as boolean, this.movementMap.get('right') as boolean);
        const horizontal =
        this.grid.getClosestHorizontalLine(this.movementMap.get('up') as boolean, this.movementMap.get('down') as boolean);
        let xMove = 0;
        let yMove = 0;
        const distanceToClosestXLine = Math.abs(this.mousePosition.canvasMousePositionX - vertical);
        const distanceToClosestYLine = Math.abs(this.mousePosition.canvasMousePositionY - horizontal);
        if (this.isCloseEnough(distanceToClosestXLine) && !this.isOutOfCanvasBounderies('horizontal', vertical, this.grid.magneticDot.x)) {
          xMove = (vertical - this.grid.magneticDot.x);
        }
        if (this.isCloseEnough(distanceToClosestYLine) && !this.isOutOfCanvasBounderies('vertical', horizontal, this.grid.magneticDot.y)) {
          yMove = (horizontal - this.grid.magneticDot.y);
        }
        const newPosition = [xMove, yMove];
        return newPosition;
      }

      directionOfMouvement(mouseEvent: MouseEvent): void {
        if (mouseEvent.movementX < 0) {
          this.movementMap.set('left', true);
          this.movementMap.set('right', false);
        } else {
          if (mouseEvent.movementX > 0) {
            this.movementMap.set('right', true);
            this.movementMap.set('left', false);
          }
        }
        if (mouseEvent.movementY < 0) {
          this.movementMap.set('up', true);
          this.movementMap.set('down', false);
        } else {
          if (mouseEvent.movementY > 0) {
            this.movementMap.set('down', true);
            this.movementMap.set('up', false);
          }
        }
      }

      isOutOfCanvasBounderies(direction: string, closestLine: number, currentPosition: number): boolean {
        const boundingRect = RendererSingleton.canvas.querySelector('#' + this.BOUNDING_RECT_ID) as SVGElement;
        const selector = boundingRect.getBoundingClientRect() as DOMRect;
        const gridSize = RendererSingleton.renderer.selectRootElement('#backgroundGrid', true).getBoundingClientRect();
        const gridHeight = Math.round(gridSize.height);
        const gridWidth = Math.round(gridSize.width);
        const movement = closestLine - currentPosition;
        let isOutOfCanvas = false;
        if (direction === 'horizontal') {
        isOutOfCanvas = (( selector.right + movement) > gridWidth || (selector.left + movement) < 0 ) ;
        } else {
          isOutOfCanvas = ((selector.bottom + movement) > gridHeight) || ((selector.top + movement) < 0); }
        return isOutOfCanvas;
      }

    isCloseEnough(distance: number): boolean {
      return distance < (this.grid._gridSize / 2 );
    }
}
