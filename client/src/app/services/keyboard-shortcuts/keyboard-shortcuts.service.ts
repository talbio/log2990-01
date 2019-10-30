import {Injectable} from '@angular/core';
import {Tools} from '../../data-structures/Tools';
import {ModalManagerService} from '../modal-manager/modal-manager.service';
import {RendererSingleton} from '../renderer-singleton';
import {GridTogglerService} from '../tools/grid/grid-toggler.service';
import {ObjectSelectorService} from '../tools/object-selector/object-selector.service';
import {ToolManagerService} from '../tools/tool-manager/tool-manager.service';
import { ClipboardService } from './../tools/clipboard/clipboard.service';

@Injectable({
  providedIn: 'root',
})
export class KeyboardShortcutsService {

  private readonly PENCIL_KEY = 'c';
  private readonly PAINTBRUSH_KEY = 'w';
  private readonly LINE_KEY = 'l';
  private readonly DELETE_FULL_ELEMENT_KEY = 'Escape';
  private readonly DELETE_LAST_ELEMENT_KEY = 'Backspace';
  private readonly RECTANGLE_KEY = '1';
  private readonly ELLIPSE_KEY = '2';
  private readonly POLYGON_KEY = '3';
  private readonly COLOR_APPLICATOR_KEY = 'r';
  private readonly NEW_DRAWING_KEY = 'o';
  private readonly EYEDROPPER_KEY = 'i';
  private readonly GRID_KEY = 'g';
  private readonly SELECT_ALL_KEY = 'a';
  private readonly COPY_KEY = 'c';
  private readonly CUT_KEY = 'x';
  private readonly DUPLICATE_KEY = 'd';
  private readonly DELETE_KEY = 'delete';
  private readonly PASTE_KEY = 'v';

  private readonly oneKeyShortcuts: Map<string, () => void>;
  private readonly controlKeyShortcuts: Map<string, () => void>;

  constructor(private toolManager: ToolManagerService,
              private gridToggler: GridTogglerService,
              private objectSelector: ObjectSelectorService,
              private modalManagerService: ModalManagerService,
              private clipboard: ClipboardService) {
    this.oneKeyShortcuts = new Map<string, () => void>();
    this.controlKeyShortcuts = new Map<string, () => void>();
    this.setControlKeyShortcuts();
    this.setOneCommandShortcuts();
  }

  get getOneKeyShortcuts(): Map<string, () => void> {
    return this.oneKeyShortcuts;
  }

  get getControlKeyShortcuts(): Map<string, () => void> {
    return this.controlKeyShortcuts;
  }

  private setOneCommandShortcuts(): void {
    // path shortcuts
    this.oneKeyShortcuts.set(this.PENCIL_KEY, () => this.toolManager._activeTool = Tools.Pencil);
    this.oneKeyShortcuts.set(this.PAINTBRUSH_KEY, () => this.toolManager._activeTool = Tools.Brush);
    this.oneKeyShortcuts.set(this.LINE_KEY, () => this.toolManager._activeTool = Tools.Line);
    this.oneKeyShortcuts.set(this.DELETE_FULL_ELEMENT_KEY, () => this.toolManager.escapePress());
    this.oneKeyShortcuts.set(this.DELETE_LAST_ELEMENT_KEY, () => this.toolManager.backSpacePress());

    // shape shortcuts
    this.oneKeyShortcuts.set(this.RECTANGLE_KEY, () => this.toolManager._activeTool = Tools.Rectangle);
    this.oneKeyShortcuts.set(this.ELLIPSE_KEY, () => this.toolManager._activeTool = Tools.Ellipse);
    this.oneKeyShortcuts.set(this.POLYGON_KEY, () => this.toolManager._activeTool = Tools.Polygon);

    // personalization shortcuts
    this.oneKeyShortcuts.set(this.COLOR_APPLICATOR_KEY, () => this.toolManager._activeTool = Tools.ColorApplicator);
    this.oneKeyShortcuts.set(this.EYEDROPPER_KEY, () => this.toolManager._activeTool = Tools.Eyedropper);
    this.oneKeyShortcuts.set(this.GRID_KEY, () => this.gridToggler.toggleGrid());

    // clipboard shortcuts
    this.oneKeyShortcuts.set(this.COPY_KEY, () => this.clipboard.copy());
    this.oneKeyShortcuts.set(this.CUT_KEY, () => this.clipboard.cut());
    this.oneKeyShortcuts.set(this.DELETE_KEY, () => this.clipboard.delete());
    this.oneKeyShortcuts.set(this.DUPLICATE_KEY, () => this.clipboard.duplicate());
    this.oneKeyShortcuts.set(this.PASTE_KEY, () => this.clipboard.paste());
  }

  private setControlKeyShortcuts(): void {
    this.controlKeyShortcuts.set(this.SELECT_ALL_KEY, () => {
      this.toolManager._activeTool = Tools.Selector;
      const canvas = RendererSingleton.renderer.selectRootElement('#canvas', true);
      this.objectSelector.selectAll(canvas);
    });
    this.controlKeyShortcuts.set(this.NEW_DRAWING_KEY, () => this.modalManagerService.showCreateDrawingDialog());
  }
}
