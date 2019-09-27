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
  private canvasElement: any;

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

  onShiftDown(keyboardEvent: KeyboardEvent) {
     console.log('shift marche!');
    //  if (keyboardEvent.key === 'Shift') {
    //   // this.toolManager.shiftDown = true;

    // }
  }
  onRightClick(mouseEvent: any) {
    this.toolManager.changeElementRightClick(mouseEvent.target);
    //deactivate context menu on right click
    return false;
  }
}
