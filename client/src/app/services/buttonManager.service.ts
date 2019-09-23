import { Injectable } from '@angular/core';

@Injectable()
export class ButtonManagerService {

  activeMode = 'pen';

constructor() {}

  activateRectangle() {
    this.activeMode = 'rectangle';
  }

  activatePen() {
    this.activeMode = 'pen';
  }
}
