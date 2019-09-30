import {Component, HostListener, Inject, OnInit, Renderer2} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ToolManagerService} from '../../../services/tools/tool-manager/tool-manager.service';
import {GiveUpChangesDialogComponent} from '../give-up-changes-dialog/give-up-changes-dialog.component';

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

  constructor(private dialogRef: MatDialogRef<CreateDrawingDialogComponent>,
              private formBuilder: FormBuilder,
              private dialog: MatDialog,
              private renderer: Renderer2,
              private toolManager: ToolManagerService,
              @Inject(MAT_DIALOG_DATA) private data: DialogData) {
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
    // tslint:disable-next-line:no-non-null-assertion
    return this.drawingForm.get('height')!;
  }

  get width(): AbstractControl {
    // we are sure that this is non null, (see drawingForm declaration)
    // tslint:disable-next-line:no-non-null-assertion
    return this.drawingForm.get('width')!;
  }

  get color(): AbstractControl {
    // we are sure that this is non null, (see drawingForm declaration)
    // tslint:disable-next-line:no-non-null-assertion
    return this.drawingForm.get('color')!;
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

  protected clear(formControlName: AbstractControl): void {
    formControlName.setValue('');
  }

  @HostListener('window:resize', ['$event'])
  protected onResize(): void {
    this.updateWidthAndHeight();
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected async onSubmit(): Promise<void> {
    if (this.data.drawingNonEmpty) {
      await this.openConfirmGiveUpChangesDialog().then((confirm) => {
        if (confirm) {
          this.toolManager.deleteAllDrawings();
          this.dialogRef.close(this.drawingForm.value);
        }
      });
    } else {
      this.dialogRef.close(this.drawingForm.value);
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

}
