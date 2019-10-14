import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class GridTogglerService {

  // private readonly URL_GRID_PATTERN = `url(#backgroundGridPattern)`;
  protected hidden: boolean;
  protected gridSize: number;
  protected gridOpacity: number;
  // Defined at onInit in workzone component
  private grid: SVGElement;

  isVisibilityChange: Subject<boolean> = new Subject<boolean>();

  constructor() {
    this.gridSize = 50;
    this.gridOpacity = 0.4;
  }

  toggleGrid() {
    if ( this.grid.getAttribute('visibility') === 'visible') {
      this.grid.setAttribute('visibility', 'hidden');
    } else {
      this.grid.setAttribute('visibility', 'visible');
    }
  }

  get _grid(): SVGElement {
    return this.grid;
  }

  set _grid(gridElement: SVGElement) {
    this.grid = gridElement;
  }

  set _gridSize(size: number) {
    this.gridSize = size;
  }

  get _gridSize() { return this.gridSize; }

  set _gridOpacity(opacity: number) { this.gridOpacity = opacity; }

  get _gridOpacity() {
    return this.gridOpacity;
  }
}
