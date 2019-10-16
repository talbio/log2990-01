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
import {CreateDrawingFormValues} from '../../../../data-structures/CreateDrawingFormValues';
import {Tools} from '../../../../data-structures/Tools';
import {ModalManagerService} from '../../../../services/modal-manager/modal-manager.service';
import {DialogProperties} from '../abstract-dialog-button/abstract-dialog-button.component';
import {ToolProperties} from '../abstract-tool-button/abstract-tool-button.component';

const RECTANGLE_ICON_PATH = '../../../../assets/svg-icons/rectangle-icon.svg';
const ELLIPSE_ICON_PATH = '../../../../assets/svg-icons/ellipse.svg';
const ADD_TAG_ICON_PATH = '../../../../assets/svg-icons/add-tag.svg';
const DELETE_TAG_ICON_PATH = '../../../../assets/svg-icons/delete-tag.svg';

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

  toolsButtonsProperties: ToolProperties[];
  dialogsButtonsProperties: DialogProperties[];

  constructor(private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer,
              private modalManagerService: ModalManagerService) {
    this.loadSVGIcons();
    this.setAppropriateIconsClass();
    this.initializeToolsButtons();
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
    this.matIconRegistry.addSvgIcon('rectangle',
      this.domSanitizer.bypassSecurityTrustResourceUrl(RECTANGLE_ICON_PATH));
    this.matIconRegistry.addSvgIcon('ellipse',
      this.domSanitizer.bypassSecurityTrustResourceUrl(ELLIPSE_ICON_PATH));
    this.matIconRegistry.addSvgIcon('add-tag',
      this.domSanitizer.bypassSecurityTrustResourceUrl(ADD_TAG_ICON_PATH));
    this.matIconRegistry.addSvgIcon('delete-tag',
      this.domSanitizer.bypassSecurityTrustResourceUrl(DELETE_TAG_ICON_PATH));
  }

  private initializeToolsButtons() {
    this.toolsButtonsProperties = [];
    this.toolsButtonsProperties.push(
      this.toolPropertiesFactory(Tools.Pencil, 'Crayon', 'create', false));
    this.toolsButtonsProperties.push(
      this.toolPropertiesFactory(Tools.Brush, 'Pinceau', 'brush', false));
    this.toolsButtonsProperties.push(
      this.toolPropertiesFactory(Tools.Rectangle, 'Rectangle', 'rectangle', true));
    this.toolsButtonsProperties.push(
      this.toolPropertiesFactory(Tools.Line, 'Ligne', 'timeline', false));
    this.toolsButtonsProperties.push(
      this.toolPropertiesFactory(Tools.Ellipse, 'Ellipse', 'ellipse', true));
    this.toolsButtonsProperties.push(
      this.toolPropertiesFactory(Tools.Stamp, 'Étampe', 'sentiment_satisfied_alt', false));
    this.toolsButtonsProperties.push(
      this.toolPropertiesFactory(Tools.ColorApplicator, 'Applicateur de couleur', 'format_paint', false));
    this.toolsButtonsProperties.push(
      this.toolPropertiesFactory(Tools.Eyedropper, 'Pipette', 'colorize', false));
  }

  private initializeDialogsButtons() {
    this.dialogsButtonsProperties = [];
    this.dialogsButtonsProperties.push(
      this.dialogPropertiesFactory(
        () => this.modalManagerService.showCreateDrawingDialog(), 'Nouveau Dessin', 'add', false));
    this.dialogsButtonsProperties.push(
      this.dialogPropertiesFactory(
        () => this.modalManagerService.showSaveDrawingDialog(), 'Sauvegarder Dessin', 'save', false));
    this.dialogsButtonsProperties.push(
      this.dialogPropertiesFactory(
        () => this.modalManagerService.showOpenDrawingDialog(), 'Ouvrir un Dessin', 'folder_open', false));
    this.dialogsButtonsProperties.push(
      this.dialogPropertiesFactory(
        () => this.modalManagerService.showUserManualDialog(), `Guide d'utilisation`, 'contact_support', false));
  }

  private toolPropertiesFactory(tool: Tools, matToolTip: string, icon: string, isSvgIcon: boolean): ToolProperties {
    return {tool, matToolTip, icon, isSvgIcon};
  }

  private dialogPropertiesFactory(onClickFunction: () => void, matToolTip: string, icon: string, isSvgIcon: boolean): DialogProperties {
    return { openDialog: onClickFunction, matToolTip, icon, isSvgIcon};
  }
}
