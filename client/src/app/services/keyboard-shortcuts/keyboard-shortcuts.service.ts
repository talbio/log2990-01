import {Injectable} from '@angular/core';
// tslint:disable-next-line: max-line-length
import { COLOR_APPLICATOR_KEY, COPY_KEY, CUT_KEY, DELETE_FULL_ELEMENT_KEY, DELETE_KEY, DELETE_LAST_ELEMENT_KEY, DUPLICATE_KEY, ELLIPSE_KEY, ERASER_KEY, EYEDROPPER_KEY, GRID_KEY, LINE_KEY, NEW_DRAWING_KEY, OPEN_DRAWING_KEY, PAINTBRUSH_KEY, PASTE_KEY, PEN_KEY, PENCIL_KEY, POLYGON_KEY, RECTANGLE_KEY, SAVE_DRAWING_KEY, SELECT_ALL_KEY, SELECTION_KEY } from 'src/app/data-structures/constants';
import {Tools} from '../../data-structures/tools';
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
    const shortcuts: [string, () => void][] = [];
    shortcuts.push(
      // path shortcuts
      [PENCIL_KEY, () => this.toolManager._activeTool = Tools.Pencil],
      [PAINTBRUSH_KEY, () => this.toolManager._activeTool = Tools.Brush],
      [LINE_KEY, () => this.toolManager._activeTool = Tools.Line],
      [DELETE_FULL_ELEMENT_KEY, () => this.toolManager.escapePress()],
      [DELETE_LAST_ELEMENT_KEY, () => this.toolManager.backSpacePress()],
      [PEN_KEY, () => this.toolManager._activeTool = Tools.Pen],
      [ERASER_KEY, () => this.toolManager._activeTool = Tools.Eraser],
      [SELECTION_KEY, () => this.toolManager._activeTool = Tools.Selector],
      // shape shortcuts
      [RECTANGLE_KEY, () => this.toolManager._activeTool = Tools.Rectangle],
      [ELLIPSE_KEY, () => this.toolManager._activeTool = Tools.Ellipse],
      [POLYGON_KEY, () => this.toolManager._activeTool = Tools.Polygon],
      // personalization shortcuts
      [COLOR_APPLICATOR_KEY, () => this.toolManager._activeTool = Tools.ColorApplicator],
      [EYEDROPPER_KEY, () => this.toolManager._activeTool = Tools.Eyedropper],
      [GRID_KEY, () => this.gridToggler.toggleGrid()],
      // clipboard shortcuts
      [DELETE_KEY, () => this.clipboard.delete()],
    );
    shortcuts.forEach((shortcut: [string, () => void]) => {
      this.oneKeyShortcuts.set(shortcut[0], shortcut[1]);
    });
  }

  private setControlKeyShortcuts(): void {
    const shortcuts: [string, () => void][] = [];
    shortcuts.push(
      [SELECT_ALL_KEY, () => {
        this.toolManager._activeTool = Tools.Selector;
        this.objectSelector.selectAll(RendererSingleton.canvas);
      }],
      [NEW_DRAWING_KEY, () => this.modalManagerService.showCreateDrawingDialog()],
      [SAVE_DRAWING_KEY, () => this.modalManagerService.showSaveDrawingDialog()],
      [OPEN_DRAWING_KEY, () => this.modalManagerService.showOpenDrawingDialog()],
      // clipboard shortcuts
      [COPY_KEY, () => this.clipboard.copy()],
      [CUT_KEY, () => this.clipboard.cut()],
      [DUPLICATE_KEY, () => this.clipboard.duplicate()],
      [PASTE_KEY, () => this.clipboard.paste()],
    );
    shortcuts.forEach((shortcut: [string, () => void]) => {
      this.controlKeyShortcuts.set(shortcut[0], shortcut[1]);
    });
  }
}
