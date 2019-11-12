import { ComponentPortal } from '@angular/cdk/portal';
import {AfterViewInit, ChangeDetectorRef, Component, HostListener, Renderer2, ViewChild} from '@angular/core';
import {MatCardContent} from '@angular/material/card';
import {MatSidenavModule} from '@angular/material/sidenav';
import {KeyboardShortcutsService} from '../../../services/keyboard-shortcuts/keyboard-shortcuts.service';
import {MousePositionService} from '../../../services/mouse-position/mouse-position.service';
import {RendererSingleton} from '../../../services/renderer-singleton';
import {ModalManagerSingleton} from '../../modals/modal-manager-singleton';
import {ToolsAttributesBarComponent} from '../tools-attributes-module/tools-attributes-bar/tools-attributes-bar.component';
import {WorkZoneComponent} from '../work-zone/work-zone.component';

@Component({
  selector: 'app-drawing-view',
  templateUrl: './drawing-view.component.html',
  styleUrls: ['./drawing-view.component.scss'],
})
export class DrawingViewComponent implements AfterViewInit {
  @ViewChild('workZoneComponent', { static: false }) workZoneComponent: WorkZoneComponent;
  @ViewChild('attributesSideNav', { static: false }) attributesSideNav: MatSidenavModule;
  @ViewChild('toolsAttributes', { static: false }) toolsAttributes: MatCardContent;

  protected toolAttributesComponent: ComponentPortal<ToolsAttributesBarComponent>;

  private canvas: SVGElement;

  constructor(private cd: ChangeDetectorRef,
              private renderer: Renderer2,
              private mousePosition: MousePositionService,
              private keyBoardShortcuts: KeyboardShortcutsService) {
    this.toolAttributesComponent = new ComponentPortal(ToolsAttributesBarComponent);
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
    this.canvas = this.renderer.selectRootElement('#canvas', true);
    RendererSingleton.instantiate(this.renderer);
  }

  @HostListener('document:keydown', ['$event'])
  keyDownEvent(keyboardEvent: KeyboardEvent) {
    // Verify that no dialog is open before checking for hotkeys
    const modalManager = ModalManagerSingleton.getInstance();
    if (!modalManager._isModalActive) {
      if (keyboardEvent.ctrlKey) {
        keyboardEvent.preventDefault();
        if (keyboardEvent.shiftKey) {
          this.executeShortcutFunction(this.keyBoardShortcuts.getControlShiftKeyShortcuts, keyboardEvent.key);
        } else {
          this.executeShortcutFunction(this.keyBoardShortcuts.getControlKeyShortcuts, keyboardEvent.key);
        }
      } else {
        this.executeShortcutFunction(this.keyBoardShortcuts.getOneKeyShortcuts, keyboardEvent.key);
      }
    } else {
      if (keyboardEvent.ctrlKey) {
        keyboardEvent.preventDefault();
      }
    }
  }

  @HostListener('document:mousemove', ['$event'])
  mouseMoveEvent(mouseEvent: MouseEvent) {
    // Listen to the mouse's position in the page and communicate it to the service so it is available to all components.
    const OFFSET_CANVAS_Y = this.canvas.getBoundingClientRect().top;
    const OFFSET_CANVAS_X = this.canvas.getBoundingClientRect().left;
    this.mousePosition.pageMousePositionX = mouseEvent.pageX;
    this.mousePosition.pageMousePositionY = mouseEvent.pageY;
    this.mousePosition.canvasMousePositionX = (mouseEvent.pageX - OFFSET_CANVAS_X);
    this.mousePosition.canvasMousePositionY = (mouseEvent.pageY - OFFSET_CANVAS_Y);
  }

  private executeShortcutFunction(shortcutsToFunction: Map<string, () => void>, key: string): void {
    const shortcutFunction: (() => void) | undefined = shortcutsToFunction.get(key.toLowerCase());
    if (shortcutFunction) {
      shortcutFunction();
    }
  }

}
