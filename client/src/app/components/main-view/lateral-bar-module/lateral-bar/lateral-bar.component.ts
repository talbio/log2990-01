import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {MatSidenav} from '@angular/material/sidenav';
import {DomSanitizer} from '@angular/platform-browser';
import { ToolManagerService } from 'src/app/services/tools/tool-manager/tool-manager.service';
import {CreateDrawingFormValues} from '../../../../data-structures/create-drawing-form-values';
import {Tools} from '../../../../data-structures/tools';
import {ModalManagerService} from '../../../../services/modal-manager/modal-manager.service';
import {UndoRedoService} from '../../../../services/undo-redo/undo-redo.service';
import { ClipboardProperties } from '../abstract-clipboard/abstract-clipboard.component';
import {DialogProperties} from '../abstract-dialog-button/abstract-dialog-button.component';
import {ToolProperties} from '../abstract-tool-button/abstract-tool-button.component';
import { DEFAULT_PENCIL_ICON, DEFAULT_SHAPE_ICON } from './../../../../data-structures/constants';
import { ClipboardService } from './../../../../services/tools/clipboard/clipboard.service';

const RECTANGLE_ICON_PATH = '../../../../assets/svg-icons/rectangle-icon.svg';
const ELLIPSE_ICON_PATH = '../../../../assets/svg-icons/ellipse.svg';
const POLYGON_ICON_PATH = '../../../../assets/svg-icons/polygon-icon.svg';
const ADD_TAG_ICON_PATH = '../../../../assets/svg-icons/add-tag.svg';
const DELETE_TAG_ICON_PATH = '../../../../assets/svg-icons/delete-tag.svg';
const REDO_ICON_PATH = '../../../../assets/svg-icons/right-arrow.svg';
const UNDO_ICON_PATH = '../../../../assets/svg-icons/left-arrow.svg';
const ERASER_ICON_PATH = '../../../../assets/svg-icons/eraser.svg';
const PEN_ICON_PATH = '../../../../assets/svg-icons/pen.svg';
const CUT_ICON_PATH = '../../../../assets/svg-icons/cut.svg';
const DUPLICATE_ICON_PATH = '../../../../assets/svg-icons/duplicate.svg';
const PASTE_ICON_PATH = '../../../../assets/svg-icons/paste.svg';
const DELETE_ICON_PATH = '../../../../assets/svg-icons/delete.svg';
const COPY_ICON_PATH = '../../../../assets/svg-icons/copy.svg';
const FEATHER_ICON_PATH = '../../../../assets/svg-icons/feather.svg';
const PENCIL_ICON_PATH = '../../../../assets/svg-icons/create.svg';
const BRUSH_ICON_PATH = '../../../../assets/svg-icons/brush.svg';
const COLOR_APPLICATOR_ICON_PATH = '../../../../assets/svg-icons/format_paint.svg';
const SELECTOR_ICON_PATH = '../../../../assets/svg-icons/select_all.svg';
const EYEDROPPER_ICON_PATH = '../../../../assets/svg-icons/colorize.svg';
const POLYLINE_ICON_PATH = '../../../../assets/svg-icons/timeline.svg';
const EMOJI_ICON_PATH = '../../../../assets/svg-icons/sentiment_satisfied_alt.svg';
const GRID_ICON_PATH = '../../../../assets/svg-icons/grid_on.svg';
const NEW_DRAWING_ICON_PATH = '../../../../assets/svg-icons/add.svg';
const SAVE_DRAWING_ICON_PATH = '../../../../assets/svg-icons/save.svg';
const OPEN_DRAWING_ICON_PATH = '../../../../assets/svg-icons/folder_open.svg';
const USER_GUIDE_ICON_PATH = '../../../../assets/svg-icons/contact_support.svg';

@Component({
  selector: 'app-lateral-bar',
  templateUrl: './lateral-bar.component.html',
  styleUrls: ['./lateral-bar.component.scss'],
})
export class LateralBarComponent {
  /* Need access to attributesSideNav to toggle when clicking on tool */
  @Input() attributesSideNav: MatSidenav;
  /* EventEmitter to transmit formValues to parent */
  @Output() createDrawing = new EventEmitter<CreateDrawingFormValues>();

  protected appropriateClass: string;

  private readonly HEIGHT_THRESHOLD = 412;

  pencilToolsButtonsProperties: ToolProperties[];
  shapeToolsButtonsProperties: ToolProperties[];
  clipboardButtonsProperties: ClipboardProperties[];
  dialogsButtonsProperties: DialogProperties[];
  private lastPencilIcon: string;
  private lastShapeIcon: string;

  constructor(private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer,
              private modalManagerService: ModalManagerService,
              private clipboard: ClipboardService,
              protected undoRedoService: UndoRedoService,
              protected toolManager: ToolManagerService) {
    this.loadSVGIcons();
    this.setAppropriateIconsClass();
    this.initializeClipboardButtons();
    this.initializePencilToolsButtons();
    this.initializeShapeToolsButtons();
    this.initializeDialogsButtons();
    this.lastPencilIcon = DEFAULT_PENCIL_ICON;
    this.lastShapeIcon = DEFAULT_SHAPE_ICON;
  }

  protected get Tools() {
    return Tools;
  }

  /**
   * @desc when the window gets to small,
   * this listener prevents the bottom buttons to mix with the top buttons
   * of the tools side nav.
   */
  @HostListener('window:resize', ['$event'])
  protected setAppropriateIconsClass() {
    if (window.innerHeight <= this.HEIGHT_THRESHOLD) {
      this.appropriateClass = 'bottomRelative';
    } else {
      this.appropriateClass = 'bottomStick';
    }
  }

  private loadSVGIcons(): void {
    const icons: [string, string][] = [];
    icons.push(
      ['rectangle', RECTANGLE_ICON_PATH],
      ['polygon', POLYGON_ICON_PATH],
      ['ellipse', ELLIPSE_ICON_PATH],
      ['add-tag', ADD_TAG_ICON_PATH],
      ['delete-tag', DELETE_TAG_ICON_PATH],
      ['eraser', ERASER_ICON_PATH],
      ['undo', UNDO_ICON_PATH],
      ['redo', REDO_ICON_PATH],
      ['pen', PEN_ICON_PATH],
      ['cut', CUT_ICON_PATH],
      ['duplicate', DUPLICATE_ICON_PATH],
      ['copy', COPY_ICON_PATH],
      ['paste', PASTE_ICON_PATH],
      ['delete', DELETE_ICON_PATH],
      ['feather', FEATHER_ICON_PATH],
      ['create', PENCIL_ICON_PATH],
      ['brush', BRUSH_ICON_PATH],
      ['format_paint', COLOR_APPLICATOR_ICON_PATH],
      ['select_all', SELECTOR_ICON_PATH],
      ['colorize', EYEDROPPER_ICON_PATH],
      ['timeline', POLYLINE_ICON_PATH],
      ['sentiment_satisfied_alt', EMOJI_ICON_PATH],
      ['grid_on', GRID_ICON_PATH],
      ['add', NEW_DRAWING_ICON_PATH],
      ['save', SAVE_DRAWING_ICON_PATH],
      ['folder_open', OPEN_DRAWING_ICON_PATH],
      ['contact_support', USER_GUIDE_ICON_PATH],
    );
    icons.forEach( (icon: [string, string]) =>
      this.matIconRegistry.addSvgIcon(icon[0], this.domSanitizer.bypassSecurityTrustResourceUrl(icon[1])));
  }

  private initializePencilToolsButtons() {
    this.pencilToolsButtonsProperties = [];
    const propertyTable: [Tools, string, string][] = [];
    propertyTable.push(
      [Tools.Pencil, 'Crayon (C)', 'create'],
      [Tools.Pen, 'Stylo (Y)', 'pen'],
      [Tools.Brush, 'Pinceau (W)', 'brush'],
      [Tools.ColorApplicator, 'Applicateur de couleur (R)', 'format_paint'],
      [Tools.Selector, 'Outil de sélection (S)', 'select_all'],
      [Tools.Eyedropper, 'Pipette (I)', 'colorize'],
      [Tools.Eraser, 'Efface (E)', 'eraser'],
      [Tools.Feather, 'Plume (P)', 'feather'],
    );
    propertyTable.forEach( (property: [Tools, string, string]) => {
      this.pencilToolsButtonsProperties.push(
        this.toolPropertiesFactory(property[0], property[1], property[2]),
      );
    });
  }

  private initializeShapeToolsButtons() {
    this.shapeToolsButtonsProperties = [];
    const propertyTable: [Tools, string, string][] = [];
    propertyTable.push(
      [Tools.Polygon, 'Polygone (3)', 'polygon'],
      [Tools.Rectangle, 'Rectangle (1)', 'rectangle'],
      [Tools.Line, 'Ligne (L)', 'timeline'],
      [Tools.Ellipse, 'Ellipse (2)', 'ellipse'],
      [Tools.Stamp, 'Étampe', 'sentiment_satisfied_alt'],
      [Tools.Grid, 'Grille (G)', 'grid_on'],
    );
    propertyTable.forEach( (property: [Tools, string, string]) => {
      this.shapeToolsButtonsProperties.push(
        this.toolPropertiesFactory(property[0], property[1], property[2]));
    });
  }

  private initializeClipboardButtons() {
    this.clipboardButtonsProperties = [];
    const propertyTable: [() => void, string, string][] = [];
    propertyTable.push(
      [() => {this.clipboard.copy(); }, 'Copier (Ctrl + C)', 'copy'],
      [() => this.clipboard.cut(), 'Couper (Ctrl + X)', 'cut'],
      [() => this.clipboard.delete(), 'Supprimer (Suppr.)', 'delete'],
      [() => this.clipboard.duplicate(), 'Dupliquer (Ctrl + D)', 'duplicate'],
      [() => this.clipboard.paste(), 'Coller (Ctrl + V)', 'paste'],
    );
    propertyTable.forEach( (property: [() => void, string, string]) => {
      this.clipboardButtonsProperties.push(
        this.clipboardPropertiesFactory(property[0], property[1], property[2]));
    });
  }

  private initializeDialogsButtons() {
    this.dialogsButtonsProperties = [];
    const propertyTable: [() => void, string, string][] = [];
    propertyTable.push(
      [() => this.modalManagerService.showCreateDrawingDialog(), 'Nouveau Dessin (Ctrl + O)', 'add'],
      [() => this.modalManagerService.showSaveDrawingDialog(), 'Sauvegarder Dessin (Ctrl + S)', 'save'],
      [() => this.modalManagerService.showOpenDrawingDialog(), 'Ouvrir un Dessin (Ctrl + G)', 'folder_open'],
      [() => this.modalManagerService.showUserManualDialog(), `Guide d'utilisation`, 'contact_support'],
    );
    propertyTable.forEach( (property: [() => void, string, string]) => {
      this.dialogsButtonsProperties.push(
        this.dialogPropertiesFactory(property[0], property[1], property[2]));
    });
  }

  private toolPropertiesFactory(tool: Tools, matToolTip: string, icon: string): ToolProperties {
    return {tool, matToolTip, icon};
  }

  private dialogPropertiesFactory(onClickFunction: () => void, matToolTip: string, icon: string): DialogProperties {
    return { openDialog: onClickFunction, matToolTip, icon};
  }

  private clipboardPropertiesFactory(onClickFunction: () => void,
                                     matToolTip: string, icon: string): ClipboardProperties {
    return { clipboardFunction: onClickFunction, matToolTip, icon};
  }

  protected findActivePencilIcon(activeTool: Tools): string {
    let icon = this.lastPencilIcon;
    this.pencilToolsButtonsProperties.forEach((toolProperty: ToolProperties) => {
      if (toolProperty.tool === activeTool) {
        this.lastPencilIcon = toolProperty.icon;
        icon = toolProperty.icon;
      }
    });
    return icon;
  }

  protected findActiveShapeIcon(activeTool: Tools): string {
    let icon = this.lastShapeIcon;
    this.shapeToolsButtonsProperties.forEach((toolProperty: ToolProperties) => {
      if (toolProperty.tool === activeTool) {
        this.lastShapeIcon = toolProperty.icon;
        icon = toolProperty.icon;
      }
    });
    return icon;
  }
}
