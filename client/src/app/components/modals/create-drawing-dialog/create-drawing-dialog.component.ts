import {Component, HostListener, Inject, OnInit, Renderer2} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ToolManagerService} from '../../../services/tools/tool-manager/tool-manager.service';
import {GiveUpChangesDialogComponent} from '../give-up-changes-dialog/give-up-changes-dialog.component';
import { ModalManagerSingleton } from '../modal-manager-singleton';
import { ClipboardService } from './../../../services/tools/clipboard/clipboard.service';
import { UndoRedoService } from './../../../services/undo-redo/undo-redo.service';

export interface DialogData {
  drawingNonEmpty: boolean;
}

@Component({
  selector: 'app-create-drawing-dialog',
  templateUrl: './create-drawing-dialog.component.html',
  styleUrls: ['./create-drawing-dialog.component.scss'],
})
export class CreateDrawingDialogComponent implements OnInit {

  protected readonly DIALOG_TITLE = 'Créer un nouveau dessin';
  protected readonly POS_NUMBER_REQUIRED = 'Nombre positif requis!';
  protected readonly COLOR_HAS_TO_BE_A_HEX_VALUE = 'La couleur doit être une valeur hexadécimale !';
  private readonly DEFAULT_WHITE_COLOR = '#FFFFFF';

  protected drawingForm: FormGroup;
  private canvasHeight: number;
  private canvasWidth: number;
  private workZoneSize: DOMRect;
  private modalManager = ModalManagerSingleton.getInstance();

  constructor(private dialogRef: MatDialogRef<CreateDrawingDialogComponent>,
              private formBuilder: FormBuilder,
              private dialog: MatDialog,
              private renderer: Renderer2,
              private toolManager: ToolManagerService,
              private clipboard: ClipboardService,
              private undoRedo: UndoRedoService,
              @Inject(MAT_DIALOG_DATA) private data: DialogData) {
                this.modalManager._isModalActive = true;
                this.afterClose();
  }

  ngOnInit(): void {
    this.drawingForm = this.formBuilder.group({
      height: [0, [
        Validators.required,
        Validators.min(0),
        Validators.pattern('^[0-9]*$'),
      ]],
      width: [0, [
        Validators.required,
        Validators.min(0),
        Validators.pattern('^[0-9]*$'),
      ]],
      color: [this.DEFAULT_WHITE_COLOR, [
        Validators.required,
        Validators.pattern('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'),
      ]],
    });
    this.updateWidthAndHeight();
  }

  get height(): AbstractControl {
    // we are sure that this is non null, (see drawingForm declaration)
    return this.drawingForm.get('height') as AbstractControl;
  }

  get width(): AbstractControl {
    // we are sure that this is non null, (see drawingForm declaration)
    return this.drawingForm.get('width') as AbstractControl;
  }

  get color(): AbstractControl {
    // we are sure that this is non null, (see drawingForm declaration)
    return this.drawingForm.get('color') as AbstractControl;
  }

  set color(colorValue) {
    this.color.setValue(colorValue);
  }

  get posNumberRequired(): string {
    return this.POS_NUMBER_REQUIRED;
  }

  get colorHasToBeHexValue(): string {
    return this.COLOR_HAS_TO_BE_A_HEX_VALUE;
  }

  clear(formControlName: AbstractControl): void {
    formControlName.setValue('');
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updateWidthAndHeight();
  }

  close(): void {
    this.dialogRef.close();
  }

  async submit(): Promise<void> {
    if (this.data.drawingNonEmpty) {
      await this.openConfirmGiveUpChangesDialog().then((confirm) => {
        if (confirm) {
          this.toolManager.deleteAllDrawings();
          this.setupNewDrawing();
          this.dialogRef.close(this.drawingForm.value);
          this.modalManager._isModalActive = false;
        }
      });
    } else {
      this.dialogRef.close(this.drawingForm.value);
      this.modalManager._isModalActive = false;
    }
  }

  private async openConfirmGiveUpChangesDialog(): Promise<boolean> {
    let confirm = false;
    const dialogRef = this.dialog.open(GiveUpChangesDialogComponent);
    await dialogRef.afterClosed().toPromise().then((confirmResult) => confirm = confirmResult);
    return confirm;
  }

  private updateWidthAndHeight(): void {
    this.workZoneSize = this.renderer.selectRootElement('#workZone', true).getBoundingClientRect();
    this.canvasHeight = Math.round(this.workZoneSize.height);
    this.canvasWidth = Math.round(this.workZoneSize.width);
    this.height.setValue(this.canvasHeight);
    this.width.setValue(this.canvasWidth);
  }
  setupNewDrawing(): void {
    // Empty the clipboard
    this.clipboard.reset();
    // Empty the undo and redo commands
    this.undoRedo.reset();
  }
  afterClose(): void {
    this.dialogRef.afterClosed().subscribe(() => {
      this.modalManager._isModalActive = false;
    });
  }
}
