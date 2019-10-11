import { Injectable } from '@angular/core';

@Injectable()
export class GridTogglerService {

  // private readonly URL_GRID_PATTERN = `url(#backgroundGridPattern)`;
  protected hidden: boolean;
  protected gridSize: number;
  protected gridOpacity: number;
  protected rgbaValue: string;

  constructor() {
    this.hidden = false;
    this.gridSize = 50;
    this.gridOpacity = 0.4;
  }

  toggleGrid() {
    this.hidden = !this.hidden;
  }

  _gridSize(canvas: HTMLElement, size: number) {
    this.gridSize = size;
    // const grid = canvas.children[1];
    // grid.setAttribute('width', size.toString());
    // grid.setAttribute('height', size.toString());
  }

  getGridSize() {
    return this.gridSize;
  }

  _gridOpacity(opacity: number) { this.gridOpacity = opacity; }

  changeGridTransparency(canvas: HTMLElement, opacity: number) {
    this.gridOpacity = opacity;
    if (!this.hidden) {
      canvas.children[1].setAttribute('fill-opacity', this.gridOpacity.toString());
    } else {
      canvas.children[1].setAttribute('fill-opacity', '0');
    }
  }
}
