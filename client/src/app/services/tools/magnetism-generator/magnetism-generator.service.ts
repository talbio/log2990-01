import { Injectable } from '@angular/core';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { RendererSingleton } from '../../renderer-singleton';
import { GridTogglerService } from '../grid/grid-toggler.service';

enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}

@Injectable()
export class MagnetismGeneratorService {
    private readonly HORIZONTAL: string;
    private readonly VERTICAL: string;
    private readonly BOUNDING_RECT_ID = '#boundingRect';
    private readonly BACKGROUND_GRID_ID = '#backgroundGrid';
    movementMap: Map<string, boolean> = new Map();
    initialX: number;
    initialY: number;

    constructor(private grid: GridTogglerService,
                private mousePosition: MousePositionService) {
    this.movementMap.set(Direction.Left, false);
    this.movementMap.set(Direction.Right, false);
    this.movementMap.set(Direction.Up, false);
    this.movementMap.set(Direction.Down, false);
    }

      getTranslationWithMagnetismValue(initialX: number, initialY: number): number[] {
        const vertical =
        this.grid.getClosestVerticalLine(this.movementMap.get(Direction.Left) as boolean, this.movementMap.get(Direction.Right) as boolean);
        const horizontal =
        this.grid.getClosestHorizontalLine(this.movementMap.get(Direction.Up) as boolean, this.movementMap.get(Direction.Down) as boolean);
        let xMove = 0;
        let yMove = 0;
        const distanceToClosestXLine = Math.abs( this.grid.magneticDot.x - vertical)
        - Math.abs(this.mousePosition.canvasMousePositionX - initialX);
        const distanceToClosestYLine = Math.abs(this.grid.magneticDot.y - horizontal) -
        Math.abs(this.mousePosition.canvasMousePositionY - initialY);
        if (this.isCloseEnough(distanceToClosestXLine) &&
        !this.isOutOfCanvasBounderies(this.HORIZONTAL, vertical, this.grid.magneticDot.x)) {
          xMove = (vertical - this.grid.magneticDot.x);

        }
        if (this.isCloseEnough(distanceToClosestYLine) &&
        !this.isOutOfCanvasBounderies(this.VERTICAL, horizontal, this.grid.magneticDot.y)) {
          yMove = (horizontal - this.grid.magneticDot.y);
        }
        const newPosition = [xMove, yMove];
        return newPosition;
      }

      setMovementDirection(mouseEvent: MouseEvent): void {
        if (mouseEvent.movementX === 0) {
          this.movementMap.set(Direction.Left, false);
          this.movementMap.set(Direction.Right, false);
        }
        if (mouseEvent.movementX === 0) {
          this.movementMap.set(Direction.Left, false);
          this.movementMap.set(Direction.Right, false);
        }
        if (mouseEvent.movementX < 0) {
          this.movementMap.set(Direction.Left, true);
          this.movementMap.set(Direction.Right, false);
        } else {
          if (mouseEvent.movementX > 0) {
            this.movementMap.set(Direction.Right, true);
            this.movementMap.set(Direction.Left, false);
          }
        }
        if (mouseEvent.movementY < 0) {
          this.movementMap.set(Direction.Up, true);
          this.movementMap.set(Direction.Down, false);
        } else {
          if (mouseEvent.movementY > 0) {
            this.movementMap.set(Direction.Down, true);
            this.movementMap.set(Direction.Up, false);
          }
        }
      }

      isOutOfCanvasBounderies(direction: string, closestLine: number, currentPosition: number): boolean {
        const boundingRect = RendererSingleton.canvas.querySelector(this.BOUNDING_RECT_ID) as SVGElement;
        const selector = boundingRect.getBoundingClientRect() as DOMRect;
        const movement = closestLine - currentPosition;
        const gridSize = RendererSingleton.renderer.selectRootElement(this.BACKGROUND_GRID_ID, true).getBoundingClientRect();
        const gridHeight = Math.round(gridSize.height);
        const gridWidth = Math.round(gridSize.width);
        let isOutOfCanvas = false;
        if (direction === this.HORIZONTAL) {
        isOutOfCanvas = this.isOutOfBounderies(selector.right, selector.left, movement, gridWidth) ;
        } else {
          isOutOfCanvas = this.isOutOfBounderies(selector.bottom, selector.top, movement, gridHeight) ; }
        return isOutOfCanvas;
      }

      isOutOfBounderies(bottom: number, top: number, movement: number, length: number): boolean {
        return (  (bottom + movement) < 0 || (top + movement) > length );
      }

    isCloseEnough(distance: number): boolean {
      return distance < (this.grid._gridSize / 2 );
    }
}
