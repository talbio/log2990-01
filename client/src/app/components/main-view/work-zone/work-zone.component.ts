import {  AfterViewInit, Component, HostListener, Input, OnInit, Renderer2} from '@angular/core';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';

@Component({
  selector: 'app-work-zone',
  templateUrl: './work-zone.component.html',
  styleUrls: ['./work-zone.component.scss'],
})
export class WorkZoneComponent implements OnInit, AfterViewInit {

  private readonly DEFAULT_WIDTH = 400;
  private readonly DEFAULT_HEIGHT = 800;
  private readonly SHIFT_KEY = 'SHIFT';

  @Input() width: number;
  @Input() height: number;
  // TODO: remove initialization after debugging. WHY?: cannot set svg canvas color element
  @Input() color = '#000000';

  private canvasElement: any;

  constructor(private toolManager: ToolManagerService,
              private renderer: Renderer2) {
    this.width = this.DEFAULT_WIDTH;
    this.height = this.DEFAULT_HEIGHT;
  }

  ngOnInit(): void {
    this.canvasElement = this.renderer.selectRootElement('#canvas', true);
  }

  ngAfterViewInit(): void {
    this.toolManager.loadRenderer(this.renderer);
  }

  @HostListener('document:keydown', ['$event'])
  keyDownEvent(keyboardEvent: KeyboardEvent) {
    if (keyboardEvent.key === this.SHIFT_KEY) {
      this.toolManager.changeElementShiftDown();
    }
  }
  @HostListener('document:keyup', ['$event'])
  keyUpEvent(keyboardEvent: KeyboardEvent) {
    if (keyboardEvent.key === this.SHIFT_KEY) {
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
    // deactivate context menu on right click
    return false;
  }
}
