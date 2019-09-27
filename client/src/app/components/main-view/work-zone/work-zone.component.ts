import { Component, Input, OnInit, Renderer2, HostListener } from '@angular/core';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';

@Component({
  selector: 'app-work-zone',
  templateUrl: './work-zone.component.html',
  styleUrls: ['./work-zone.component.scss'],
})
export class WorkZoneComponent implements OnInit {

  @Input() width: number;
  @Input() height: number;
  private canvasElement: HTMLElement;

  constructor(private toolManager: ToolManagerService,
              private renderer: Renderer2) {
    this.width = 800;
    this.height = 400;
  }

  ngOnInit() {
    this.canvasElement = this.renderer.selectRootElement('#canvas', true);
  }

  @HostListener('document:keydown', ['$event'])
  keyDownEvent(keyboardEvent: KeyboardEvent) { 
    if(keyboardEvent.key === "Shift")
    {
      this.toolManager.changeElementShiftDown();
    }
  }
  @HostListener('document:keyup', ['$event'])
  keyUpEvent(keyboardEvent: KeyboardEvent) { 
    if(keyboardEvent.key === "Shift")
    {
      this.toolManager.changeElementShiftUp();
    }
  }

  onMouseDown(mouseEvent: MouseEvent) {
    this.toolManager.createElement(mouseEvent, this.canvasElement);
  }

  onMouseMove(mouseEvent: MouseEvent) {
    this.toolManager.updateElement(mouseEvent, this.canvasElement);
  }

  onMouseUp() {
    this.toolManager.finishElement();
  }

  onLeftClick(mouseEvent: Event) {
    this.toolManager.changeElementLeftClick(mouseEvent.target as HTMLElement);
  }

  onRightClick(mouseEvent: Event) {
    this.toolManager.changeElementRightClick(mouseEvent.target as HTMLElement);
    //deactivate context menu on right click
    return false;
  }
}
