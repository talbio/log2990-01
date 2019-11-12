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
import {CreateDrawingFormValues} from '../../../../data-structures/create-drawing-form-values';
import {Tools} from '../../../../data-structures/tools';
import {ModalManagerService} from '../../../../services/modal-manager/modal-manager.service';
import {UndoRedoService} from '../../../../services/undo-redo/undo-redo.service';
import { ClipboardProperties } from '../abstract-clipboard/abstract-clipboard.component';
import {DialogProperties} from '../abstract-dialog-button/abstract-dialog-button.component';
import {ToolProperties} from '../abstract-tool-button/abstract-tool-button.component';
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

  constructor(private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer,
              private modalManagerService: ModalManagerService,
              private clipboard: ClipboardService,
              protected undoRedoService: UndoRedoService) {
    this.loadSVGIcons();
    this.setAppropriateIconsClass();
    this.initializeClipboardButtons();
    this.initializePencilToolsButtons();
    this.initializeShapeToolsButtons();
    this.initializeDialogsButtons();
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
    );
    icons.forEach( (icon: [string, string]) =>
      this.matIconRegistry.addSvgIcon(icon[0], this.domSanitizer.bypassSecurityTrustResourceUrl(icon[1])));
  }

  private initializePencilToolsButtons() {
    this.pencilToolsButtonsProperties = [];
    const propertyTable: [Tools, string, string, boolean][] = [];
    propertyTable.push(
      [Tools.Pencil, 'Crayon', 'create', false],
      [Tools.Pen, 'Stylo', 'pen', true],
      [Tools.Brush, 'Pinceau', 'brush', false],
      [Tools.ColorApplicator, 'Applicateur de couleur', 'format_paint', false],
      [Tools.Selector, 'Outil de sélection', 'select_all', false],
      [Tools.Eyedropper, 'Pipette', 'colorize', false],
      [Tools.Eraser, 'Efface', 'eraser', true],
    );
    propertyTable.forEach( (property: [Tools, string, string, boolean]) => {
      this.pencilToolsButtonsProperties.push(
        this.toolPropertiesFactory(property[0], property[1], property[2], property[3]),
      );
    });
  }

  private initializeShapeToolsButtons() {
    this.shapeToolsButtonsProperties = [];
    const propertyTable: [Tools, string, string, boolean][] = [];
    propertyTable.push(
      [Tools.Polygon, 'Polygone', 'polygon', true],
      [Tools.Rectangle, 'Rectangle', 'rectangle', true],
      [Tools.Line, 'Ligne', 'timeline', false],
      [Tools.Ellipse, 'Ellipse', 'ellipse', true],
      [Tools.Stamp, 'Étampe', 'sentiment_satisfied_alt', false],
      [Tools.Grid, 'Grille', 'grid_on', false],
    );
    propertyTable.forEach( (property: [Tools, string, string, boolean]) => {
      this.shapeToolsButtonsProperties.push(
        this.toolPropertiesFactory(property[0], property[1], property[2], property[3]));
    });
  }

  private initializeClipboardButtons() {
    this.clipboardButtonsProperties = [];
    const propertyTable: [() => void, string, string, boolean][] = [];
    propertyTable.push(
      [() => {this.clipboard.copy(); }, 'Copier', 'copy', true],
      [() => this.clipboard.cut(), 'Couper', 'cut', true],
      [() => this.clipboard.delete(), 'Supprimer', 'delete', true],
      [() => this.clipboard.duplicate(), 'Dupliquer', 'duplicate', true],
      [() => this.clipboard.paste(), 'Coller', 'paste', true],
    );
    propertyTable.forEach( (property: [() => void, string, string, boolean]) => {
      this.clipboardButtonsProperties.push(
        this.clipboardPropertiesFactory(property[0], property[1], property[2], property[3]));
    });
  }

  private initializeDialogsButtons() {
    this.dialogsButtonsProperties = [];
    const propertyTable: [() => void, string, string, boolean][] = [];
    propertyTable.push(
      [() => this.modalManagerService.showCreateDrawingDialog(), 'Nouveau Dessin', 'add', false],
      [() => this.modalManagerService.showSaveDrawingDialog(), 'Sauvegarder Dessin', 'save', false],
      [() => this.modalManagerService.showOpenDrawingDialog(), 'Ouvrir un Dessin', 'folder_open', false],
      [() => this.modalManagerService.showUserManualDialog(), `Guide d'utilisation`, 'contact_support', false],
    );
    propertyTable.forEach( (property: [() => void, string, string, boolean]) => {
      this.dialogsButtonsProperties.push(
        this.dialogPropertiesFactory(property[0], property[1], property[2], property[3]));
    });
  }

  private toolPropertiesFactory(tool: Tools, matToolTip: string, icon: string, isSvgIcon: boolean): ToolProperties {
    return {tool, matToolTip, icon, isSvgIcon};
  }

  private dialogPropertiesFactory(onClickFunction: () => void, matToolTip: string, icon: string, isSvgIcon: boolean): DialogProperties {
    return { openDialog: onClickFunction, matToolTip, icon, isSvgIcon};
  }

  private clipboardPropertiesFactory(onClickFunction: () => void,
                                     matToolTip: string, icon: string, isSvgIcon: boolean): ClipboardProperties {
    return { clipboardFunction: onClickFunction, matToolTip, icon, isSvgIcon};
  }
}
