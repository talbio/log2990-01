import { AfterViewInit, Component, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { Colors } from 'src/app/data-structures/Colors';
import { Tools } from 'src/app/data-structures/Tools';
import {SaveDrawingService} from '../../../services/back-end/save-drawing/save-drawing.service';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';

@Component({
  selector: 'app-work-zone',
  templateUrl: './work-zone.component.html',
  styleUrls: ['./work-zone.component.scss'],
})
export class WorkZoneComponent implements OnInit, AfterViewInit {

  private readonly DEFAULT_WIDTH = 1080;
  private readonly DEFAULT_HEIGHT = 500;
  private readonly SHIFT_KEY = 'Shift';

  @Input() width: number;
  @Input() height: number;
  @Input() color: string;

  private canvasElement: HTMLElement;

  constructor(private toolManager: ToolManagerService,
              private renderer: Renderer2,
              private saveDrawing: SaveDrawingService) {
    this.width = this.DEFAULT_WIDTH;
    this.height = this.DEFAULT_HEIGHT;
    this.color = Colors.WHITE;
  }

  ngOnInit(): void {
    this.canvasElement = this.renderer.selectRootElement('#canvas', true);
    this.saveDrawing._renderer = this.renderer;
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
    if (this.toolManager._activeTool === Tools.Selector && this.hasActiveSelector()) {
      this.toolManager.selectorLeftClick();
    } else { this.toolManager.createElement(mouseEvent, this.canvasElement); }
  }

  hasActiveSelector(): boolean {
    let hasSelector = false;
    const groupElement = this.canvasElement.querySelector('#selected');
    if (groupElement) {
      hasSelector = true;
    }
    return hasSelector;
  }

  onMouseMove(mouseEvent: MouseEvent) {
    if (this.toolManager._activeTool === Tools.Selector && this.hasActiveSelector()) {
      this.toolManager.translate(mouseEvent);
    } else {this.toolManager.updateElement(mouseEvent, this.canvasElement); }
  }

  onMouseUp() {
    if (this.toolManager._activeTool === Tools.Selector && this.hasActiveSelector()) {
      this.toolManager.finishTranslation();
    } else {this.toolManager.finishElement(); }
  }

  onLeftClick(mouseEvent: MouseEvent) {
    switch (this.toolManager._activeTool) {
      case Tools.ColorApplicator:
        this.toolManager.changeElementLeftClick(mouseEvent.target as HTMLElement);
        break;
      case Tools.Line:
        this.toolManager.createElementOnClick(mouseEvent, this.canvasElement);
        break;
      default:
        return;
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

  onMouseWheel(mouseEvent: WheelEvent) {
    this.toolManager.rotateEmoji(mouseEvent);
  }

  protected setBackGroundColor(): {'background-color': string} {
    return {
      'background-color': this.color,
    };
  }
}
