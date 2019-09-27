import {AfterViewInit, Component, Input, OnInit, Renderer2} from '@angular/core';
import { ToolManagerService } from '../../../services/tools/tool-manager/tool-manager.service';

@Component({
  selector: 'app-work-zone',
  templateUrl: './work-zone.component.html',
  styleUrls: ['./work-zone.component.scss'],
})
export class WorkZoneComponent implements OnInit, AfterViewInit {

  private readonly DEFAULT_WIDTH = 400;
  private readonly DEFAULT_HEIGHT = 800;

  @Input() width: number;
  @Input() height: number;
  // TODO: remove initialization after debugging
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
