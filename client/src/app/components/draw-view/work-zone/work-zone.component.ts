import { Component, OnInit, Renderer2 } from '@angular/core';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';

@Component({
  selector: 'app-work-zone',
  templateUrl: './work-zone.component.html',
  styleUrls: ['./work-zone.component.scss'],
})
export class WorkZoneComponent implements OnInit {

  private canvasElement: any;

  constructor(private toolManager: ToolManagerService,
              private renderer: Renderer2) { }

  ngOnInit() {
    this.canvasElement = this.renderer.selectRootElement('#canvas', true);
  }

  onMouseDown(mouseEvent: any) {
    this.toolManager.createElement(mouseEvent, this.canvasElement);
  }

  onMouseMove(mouseEvent: any) {
    this.toolManager.updateElement(mouseEvent, this.canvasElement);
  }

  onMouseUp(mouseEvent: any) {
    this.toolManager.finishElement(mouseEvent);
  }
}
