import {  AfterViewInit, Component, HostListener, Input, OnInit, Renderer2} from '@angular/core';
import { Tools } from 'src/app/data-structures/Tools';
import { ToolSelectorService } from 'src/app/services/tools/tool-selector/tool-selector.service';
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
  private readonly DEFAULT_WHITE_COLOR = '#FFFFFF';

  @Input() width: number;
  @Input() height: number;
  @Input() color: string;

  private canvasElement: any;

  constructor(private toolManager: ToolManagerService,
              private renderer: Renderer2,
              private toolSelector: ToolSelectorService) {
    this.width = this.DEFAULT_WIDTH;
    this.height = this.DEFAULT_HEIGHT;
    this.color = this.DEFAULT_WHITE_COLOR;
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

  onLeftClick(mouseEvent: MouseEvent) {
    if (this.toolSelector._activeTool === Tools.ColorApplicator) {
      this.toolManager.changeElementLeftClick(mouseEvent.target as HTMLElement);
    } else if (this.toolSelector._activeTool === Tools.Line) {
      this.toolManager.createElementOnClick(mouseEvent, this.canvasElement);
    }
  }

  onRightClick(mouseEvent: Event) {
    this.toolManager.changeElementRightClick(mouseEvent.target as HTMLElement);
    // deactivate context menu on right click
    return false;
  }

  onDoubleClick(mouseEvent: MouseEvent) {
    this.toolManager.finishElementDoubleClick(mouseEvent, this.canvasElement);
  }

  protected setBackGroundColor(): {'background-color': string} {
    return {
      'background-color': this.color,
    };
  }
}
