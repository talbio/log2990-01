import { Component, OnInit, Renderer2 } from '@angular/core';
import { ButtonManagerService } from '../../../services/buttonManager.service';
import { ModeManagerService } from '../../../services/mode-manager.service';

@Component({
  selector: 'app-work-zone',
  templateUrl: './work-zone.component.html',
  styleUrls: ['./work-zone.component.scss'],
})
export class WorkZoneComponent implements OnInit {

  constructor(private buttonManager: ButtonManagerService,
              private modeManager: ModeManagerService,
              private renderer: Renderer2) { }

  ngOnInit() {}

  onMouseDown(mouseEvent: any) {
    this.modeManager.createElement(
      this.buttonManager.activeMode,
      mouseEvent,
      this.renderer.selectRootElement('#canvas', true));
  }

  onMouseMove(mouseEvent: any) {
    this.modeManager.updateElement(
      this.buttonManager.activeMode,
      mouseEvent,
      this.renderer.selectRootElement('#canvas', true));
  }

  onMouseUp(mouseEvent: any) {
    this.modeManager.finishElement(
      this.buttonManager.activeMode,
      mouseEvent);
  }
}
