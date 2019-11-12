import {Injectable} from '@angular/core';
// tslint:disable-next-line: max-line-length
import { COLOR_APPLICATOR_KEY, COPY_KEY, CUT_KEY, DELETE_FULL_ELEMENT_KEY, DELETE_KEY, DELETE_LAST_ELEMENT_KEY, DUPLICATE_KEY, ELLIPSE_KEY, EYEDROPPER_KEY, GRID_KEY, LINE_KEY, NEW_DRAWING_KEY, OPEN_DRAWING_KEY, PAINTBRUSH_KEY, PASTE_KEY, PENCIL_KEY, POLYGON_KEY, RECTANGLE_KEY, SAVE_DRAWING_KEY, SELECT_ALL_KEY } from 'src/app/data-structures/constants';
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
    this.oneKeyShortcuts.set(PENCIL_KEY, () => this.toolManager._activeTool = Tools.Pencil);
    this.oneKeyShortcuts.set(PAINTBRUSH_KEY, () => this.toolManager._activeTool = Tools.Brush);
    this.oneKeyShortcuts.set(LINE_KEY, () => this.toolManager._activeTool = Tools.Line);
    this.oneKeyShortcuts.set(DELETE_FULL_ELEMENT_KEY, () => this.toolManager.escapePress());
    this.oneKeyShortcuts.set(DELETE_LAST_ELEMENT_KEY, () => this.toolManager.backSpacePress());

    // shape shortcuts
    this.oneKeyShortcuts.set(RECTANGLE_KEY, () => this.toolManager._activeTool = Tools.Rectangle);
    this.oneKeyShortcuts.set(ELLIPSE_KEY, () => this.toolManager._activeTool = Tools.Ellipse);
    this.oneKeyShortcuts.set(POLYGON_KEY, () => this.toolManager._activeTool = Tools.Polygon);

    // personalization shortcuts
    this.oneKeyShortcuts.set(COLOR_APPLICATOR_KEY, () => this.toolManager._activeTool = Tools.ColorApplicator);
    this.oneKeyShortcuts.set(EYEDROPPER_KEY, () => this.toolManager._activeTool = Tools.Eyedropper);
    this.oneKeyShortcuts.set(GRID_KEY, () => this.gridToggler.toggleGrid());

    // clipboard shortcuts
    this.oneKeyShortcuts.set(DELETE_KEY, () => this.clipboard.delete());
  }

  private setControlKeyShortcuts(): void {
    this.controlKeyShortcuts.set(SELECT_ALL_KEY, () => {
      this.toolManager._activeTool = Tools.Selector;
      this.objectSelector.selectAll(RendererSingleton.canvas);
    });
    this.controlKeyShortcuts.set(NEW_DRAWING_KEY, () => this.modalManagerService.showCreateDrawingDialog());
    this.controlKeyShortcuts.set(SAVE_DRAWING_KEY, () => this.modalManagerService.showSaveDrawingDialog());
    this.controlKeyShortcuts.set(OPEN_DRAWING_KEY, () => this.modalManagerService.showOpenDrawingDialog());
    // clipboard shortcuts
    this.controlKeyShortcuts.set(COPY_KEY, () => this.clipboard.copy());
    this.controlKeyShortcuts.set(CUT_KEY, () => this.clipboard.cut());
    this.controlKeyShortcuts.set(DUPLICATE_KEY, () => this.clipboard.duplicate());
    this.controlKeyShortcuts.set(PASTE_KEY, () => this.clipboard.paste());
  }
}
