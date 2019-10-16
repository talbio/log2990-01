import {ComponentPortal} from '@angular/cdk/portal';
import {AfterViewInit, ChangeDetectorRef, Component, HostListener, Renderer2, ViewChild} from '@angular/core';
import {MatCardContent} from '@angular/material/card';
import {MatSidenavModule} from '@angular/material/sidenav';
import {Tools} from '../../../data-structures/Tools';
import {ModalManagerService} from '../../../services/modal-manager/modal-manager.service';
import {MousePositionService} from '../../../services/mouse-position/mouse-position.service';
import {ToolManagerService} from '../../../services/tools/tool-manager/tool-manager.service';
import {ModalManagerSingleton} from '../../modals/modal-manager-singleton';
import {ToolsAttributesBarComponent} from '../tools-attributes-module/tools-attributes-bar/tools-attributes-bar.component';
import {WorkZoneComponent} from '../work-zone/work-zone.component';

@Component({
  selector: 'app-drawing-view',
  templateUrl: './drawing-view.component.html',
  styleUrls: ['./drawing-view.component.scss'],
})
export class DrawingViewComponent implements AfterViewInit {
  @ViewChild('workZoneComponent', {static: false}) workZoneComponent: WorkZoneComponent;
  @ViewChild('attributesSideNav', {static: false}) attributesSideNav: MatSidenavModule;
  @ViewChild('toolsAttributes', {static: false}) toolsAttributes: MatCardContent;

  protected toolAttributesComponent: ComponentPortal<ToolsAttributesBarComponent>;

  private readonly PENCIL_KEY = 'c';
  private readonly PAINTBRUSH_KEY = 'w';
  private readonly RECTANGLE_KEY = '1';
  private readonly ELLIPSE_KEY = '2';
  private readonly COLOR_APPLICATOR_KEY = 'r';
  private readonly NEW_DRAWING_KEY = 'o';
  private readonly LINE_KEY = 'l';
  private readonly DELETE_FULL_ELEMENT_KEY = 'Escape';
  private readonly DELETE_LAST_ELEMENT_KEY = 'Backspace';

  private canvas: HTMLElement;

  constructor(private cd: ChangeDetectorRef,
              private toolManager: ToolManagerService,
              private renderer: Renderer2,
              private mousePosition: MousePositionService,
              private modalManagerService: ModalManagerService) {
    this.toolAttributesComponent = new ComponentPortal(ToolsAttributesBarComponent);
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
    this.canvas = this.renderer.selectRootElement('#canvas', true);
    this.modalManagerService.loadRenderer(this.renderer);
  }

  @HostListener('document:keydown', ['$event'])
  keyDownEvent(keyboardEvent: KeyboardEvent) {
    // Verify that no dialog is open before checking for hotkeys
    const modalManager = ModalManagerSingleton.getInstance();
    if (!modalManager._isModalActive) {
      if (keyboardEvent.key === this.PENCIL_KEY) {
        this.toolManager._activeTool = Tools.Pencil;
      } else if (keyboardEvent.key === this.COLOR_APPLICATOR_KEY) {
        this.toolManager._activeTool = Tools.ColorApplicator;
      } else if (keyboardEvent.key === this.PAINTBRUSH_KEY) {
        this.toolManager._activeTool = Tools.Brush;
      } else if (keyboardEvent.key === this.RECTANGLE_KEY) {
        this.toolManager._activeTool = Tools.Rectangle;
      } else if (keyboardEvent.key === this.ELLIPSE_KEY) {
        this.toolManager._activeTool = Tools.Ellipse;
      } else if (keyboardEvent.key === this.LINE_KEY) {
        this.toolManager._activeTool = Tools.Line;
      } else if (keyboardEvent.key === this.NEW_DRAWING_KEY && keyboardEvent.ctrlKey) {
        keyboardEvent.preventDefault();
        this.modalManagerService.showCreateDrawingDialog();
      } else if (keyboardEvent.key === this.DELETE_FULL_ELEMENT_KEY) {
        this.toolManager.escapePress();
      } else if (keyboardEvent.key === this.DELETE_LAST_ELEMENT_KEY) {
        this.toolManager.backSpacePress();
      }
    }
  }
  @HostListener('document:mousemove', ['$event'])
  mouseMoveEvent(mouseEvent: MouseEvent) {
    // Listen to the mouse's position in the page and communicate it to the service so it is available to all components.
    const OFFSET_CANVAS_Y = this.canvas.getBoundingClientRect().top;
    const OFFSET_CANVAS_X = this.canvas.getBoundingClientRect().left;
    this.mousePosition._pageMousePositionX = mouseEvent.pageX;
    this.mousePosition._pageMousePositionY = mouseEvent.pageY;
    this.mousePosition._canvasMousePositionX = (mouseEvent.pageX - OFFSET_CANVAS_X);
    this.mousePosition._canvasMousePositionY = (mouseEvent.pageY - OFFSET_CANVAS_Y);
  }
}
