import { ButtonManagerService } from './../../../services/buttonManager.service';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { ModeManagerService } from './../../../services/mode-manager.service';


@Component({
  selector: 'app-work-zone',
  templateUrl: './work-zone.component.html',
  styleUrls: ['./work-zone.component.scss']
})
export class WorkZoneComponent implements OnInit {
  constructor(private modeManager: ModeManagerService, private mode: ButtonManagerService, private renderer: Renderer2) { }

  ngOnInit() {}

  fctMouseDown(e: any) {
    this.modeManager.createElement(this.mode.activeMode, e, this.renderer.selectRootElement('#canvas',true));
  }

  fctMouseMove(e: any) {
    this.modeManager.updateElement(this.mode.activeMode, e);
  }
  fctMouseUp(e: any) {
    this.modeManager.finishElement(this.mode.activeMode, e);
  }
}
