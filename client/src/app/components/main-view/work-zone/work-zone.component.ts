import {  AfterViewInit, Component, HostListener, Input, OnInit, Renderer2} from '@angular/core';
import { Colors } from 'src/app/data-structures/Colors';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';

@Component({
  selector: 'app-work-zone',
  templateUrl: './work-zone.component.html',
  styleUrls: ['./work-zone.component.scss'],
})
export class WorkZoneComponent implements OnInit, AfterViewInit {

  private readonly DEFAULT_WIDTH = 1080;
  private readonly DEFAULT_HEIGHT = 720;
  private readonly SHIFT_KEY = 'SHIFT';

  @Input() width: number;
  @Input() height: number;
  @Input() color: string;

  private canvasElement: HTMLElement;

  constructor(private toolManager: ToolManagerService,
              private renderer: Renderer2) {
    this.width = this.DEFAULT_WIDTH;
    this.height = this.DEFAULT_HEIGHT;
    this.color = Colors.WHITE;
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

  protected setBackGroundColor(): {'background-color': string} {
    return {
      'background-color': this.color,
    };
  }
}
