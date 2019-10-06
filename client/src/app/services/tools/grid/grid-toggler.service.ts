import { Injectable } from '@angular/core';

@Injectable()
export class GridTogglerService {

  protected hidden: boolean;
  protected gridSize: number;
  protected gridTransparency: number;
  protected rgbaValue: string;

  constructor() {
    this.hidden = true;
    this.gridSize = 10;
    this.gridTransparency = 1;
    this.rgbaValue = 'rgba(45, 45, 45, 1)';
  }

  toggleGrid() {
    this.hidden = !this.hidden;
  }

  _gridSize(size: number) {
    this.gridSize = size;
  }

  changeGridTransparency(transparency: number) {
    this.gridTransparency = transparency;
    this.changeRgbaValue();
  }

  changeRgbaValue() {
    if (this.hidden) {
      this.rgbaValue = 'rgba(45, 45, 45, 0)';
    } else {
      this.rgbaValue = 'rgba(45, 45, 45, ' + this.gridTransparency + ')';
    }
  }
}
