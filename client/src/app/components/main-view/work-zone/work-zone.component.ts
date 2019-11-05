import { Component, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { Colors } from 'src/app/data-structures/colors';
import { GridTogglerService } from '../../../services/tools/grid/grid-toggler.service';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';

@Component({
  selector: 'app-work-zone',
  templateUrl: './work-zone.component.html',
  styleUrls: ['./work-zone.component.scss'],
})
export class WorkZoneComponent implements OnInit {

  private readonly DEFAULT_WIDTH = 1080;
  private readonly DEFAULT_HEIGHT = 500;
  private readonly SHIFT_KEY = 'Shift';
  private readonly ALT_KEY = 'Alt';
  @Input() width: number;
  @Input() height: number;
  @Input() color: string;
  @Input() gridSize: number;

  private canvasElement: SVGElement;

  constructor(private toolManager: ToolManagerService,
              private renderer: Renderer2,
              protected gridService: GridTogglerService) {
    this.width = this.DEFAULT_WIDTH;
    this.height = this.DEFAULT_HEIGHT;
    this.gridSize = this.gridService._gridSize;
    this.color = Colors.WHITE;
  }

  ngOnInit(): void {
    this.canvasElement = this.renderer.selectRootElement('#canvas', true);
    this.gridService._grid = this.renderer.selectRootElement('#backgroundGrid', true);
    this.gridService._gridPattern = this.renderer.selectRootElement('#backgroundGridPattern', true);
  }

  @HostListener('document:keydown', ['$event'])
  keyDownEvent(keyboardEvent: KeyboardEvent) {
    if (keyboardEvent.key === this.SHIFT_KEY) {
      this.toolManager.changeElementShiftDown();
    }
    if (keyboardEvent.key === this.ALT_KEY)  {
      this.toolManager.changeElementAltDown();
      keyboardEvent.preventDefault();
    }

  }
  @HostListener('document:keyup', ['$event'])
  keyUpEvent(keyboardEvent: KeyboardEvent) {
    if (keyboardEvent.key === this.SHIFT_KEY) {
      this.toolManager.changeElementShiftUp();
    }
    if (keyboardEvent.key === this.ALT_KEY) {
      this.toolManager.changeElementAltUp();
      keyboardEvent.preventDefault();
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
    this.toolManager.changeElementLeftClick(mouseEvent.target as SVGElement, this.canvasElement);
    return true;
  }

  onRightClick(mouseEvent: Event) {
    this.toolManager.changeElementRightClick(mouseEvent.target as SVGElement);
    // deactivate context menu on right click
    return false;
  }

  onDoubleClick(mouseEvent: MouseEvent) {
    this.toolManager.finishElementDoubleClick(mouseEvent, this.canvasElement);
  }

  onMouseWheel(mouseEvent: WheelEvent) {
    this.toolManager.rotateEmoji(mouseEvent);
  }

  protected setBackGroundColor(): { 'background-color': string } {
    return {
      'background-color': this.color,
    };
  }
}
