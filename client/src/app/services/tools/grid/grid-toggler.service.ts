import { Injectable } from '@angular/core';
import { MatSliderChange } from '@angular/material';
import { Subject } from 'rxjs';

@Injectable()
export class GridTogglerService {

  protected gridSize: number;
  protected gridOpacity: number;
  // Defined at onInit in workzone component
  private grid: SVGElement;
  private gridPattern: SVGElement;

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

  get _gridPattern(): SVGElement {
    return this.gridPattern;
  }

  set _gridPattern(gridPatternElem: SVGElement) {
    this.gridPattern = gridPatternElem;
  }

  set _gridSize(size: number) {
    this.gridSize = size;
  }

  get _gridSize() { return this.gridSize; }

  set _gridOpacity(opacity: number) { this.gridOpacity = opacity; }

  get _gridOpacity() {
    return this.gridOpacity;
  }

  adjustGridSize(sliderChange: MatSliderChange): void {
    this.gridSize = sliderChange.value as number;
    // We need to change all the dependant elements in the pattern
    this.gridPattern.setAttribute('width', this.gridSize as unknown as string);
    this.gridPattern.setAttribute('height', this.gridSize as unknown as string);
    // First line
    this.gridPattern.children[0].setAttribute('x2', this.gridSize as unknown as string);
    // Second line
    this.gridPattern.children[1].setAttribute('x1', this.gridSize as unknown as string);
    this.gridPattern.children[1].setAttribute('x2', this.gridSize as unknown as string);
    this.gridPattern.children[1].setAttribute('y2', this.gridSize as unknown as string);
  }

  adjustGridOpacity(sliderChange: MatSliderChange) {
    this.gridOpacity = sliderChange.value as number;
  }
}
