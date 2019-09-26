import { Component, Input, OnInit, Renderer2 } from '@angular/core';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';

@Component({
  selector: 'app-work-zone',
  templateUrl: './work-zone.component.html',
  styleUrls: ['./work-zone.component.scss'],
})
export class WorkZoneComponent implements OnInit {

  @Input() width: number;
  @Input() height: number;
  private canvasElement: any;

  constructor(private toolManager: ToolManagerService,
              private renderer: Renderer2) {
    this.width = 800;
    this.height = 400;
  }

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

  onLeftClick(mouseEvent: any) {
    this.toolManager.changeElementLeftClick(mouseEvent.target);
  }

  onRightClick(mouseEvent: any) {
    this.toolManager.changeElementRightClick(mouseEvent.target);
    //deactivate context menu on right click
    return false;
  }
}
