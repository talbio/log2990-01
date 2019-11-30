import { Injectable } from '@angular/core';
import { MatSliderChange } from '@angular/material';

interface MagneticDot {
  x: number;
  y: number;
}

@Injectable()
export class GridTogglerService {

  protected gridSize: number;
  protected gridOpacity: number;
  magneticDot: MagneticDot;
  isMagnetic: boolean;
  // Defined at onInit in workzone component
  private grid: SVGElement;
  private gridPattern: SVGElement;
  selectedDot: number;

  constructor() {
    this.gridSize = 100;
    this.gridOpacity = 0.4;
    this.isMagnetic = false;
    this.selectedDot = 0;
    this.magneticDot = { x: 0, y: 0 };
  }

  toggleGrid() {
    if (this.grid.getAttribute('visibility') === 'visible') {
      this.grid.setAttribute('visibility', 'hidden');
    } else {
      this.grid.setAttribute('visibility', 'visible');
    }
  }

  set _grid(gridElement: SVGElement) {
    this.grid = gridElement;
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

  set _isMagnetic(isMagnetic: boolean) {
    this.isMagnetic = isMagnetic;
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
    this.grid.setAttribute('fill-opacity', this.gridOpacity as unknown as string);
  }

  setMagneticDot(dotNumber: number): void {
    this.selectedDot = dotNumber;
  }

  getClosestVerticalLine(isMovingLeft: boolean, isMovingRight: boolean): number {
    const isOnALine: boolean = ((this.magneticDot.x % this.gridSize) === 0);
    if (isMovingLeft) {
      if (isOnALine) { return (this.magneticDot.x - this.gridSize); }
      return Math.floor(this.magneticDot.x / this.gridSize) * this.gridSize;
    }
    if (isMovingRight) {
      if (isOnALine) { return (this.magneticDot.x + this.gridSize); }
      return Math.ceil(this.magneticDot.x / this.gridSize) * this.gridSize;
    }
    return 0;
  }

  getClosestHorizontalLine(isMovingUp: boolean, isMovingDown: boolean): number {
    const isOnALine: boolean = ((this.magneticDot.y % this.gridSize) === 0);
    if (isMovingUp) {
      if (isOnALine) { return (this.magneticDot.y - this.gridSize); }
      return Math.floor(this.magneticDot.y / this.gridSize) * this.gridSize;
    }
    if (isMovingDown) {
      if (isOnALine) { return (this.magneticDot.y + this.gridSize); }
      return Math.ceil(this.magneticDot.y / this.gridSize) * this.gridSize;
    }
    return 0;
  }

  setSelectedDotPosition(selectionBox: DOMRect): void {
    let x = 0;
    let y = 0;
    switch (this.selectedDot) {
      case 0:
        break;
      case 1:
        x += selectionBox.width / 2;
        break;
      case 2:
        x += selectionBox.width;
        break;
      case 3:
        y += selectionBox.height / 2;
        break;
      case 4:
        x += selectionBox.width / 2;
        y += selectionBox.height / 2;
        break;
      case 5:
        x += selectionBox.width;
        y += selectionBox.height / 2;
        break;
      case 6:
        y += selectionBox.height;
        break;
      case 7:
        x += selectionBox.width / 2;
        y += selectionBox.height;
        break;
      case 8:
        x += selectionBox.width;
        y += selectionBox.height;
        break;
    }
    this.magneticDot.x = selectionBox.x + x;
    this.magneticDot.y = selectionBox.y + y;
  }
}
