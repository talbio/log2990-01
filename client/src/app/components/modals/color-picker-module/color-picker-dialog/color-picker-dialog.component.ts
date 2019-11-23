import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ColorService } from 'src/app/services/tools/color/color.service';
import { ModalManagerSingleton } from './../../modal-manager-singleton';

export interface DialogData {
  color: string;
}

@Component({
  selector: 'app-color-picker-dialog',
  templateUrl: './color-picker-dialog.component.html',
  styleUrls: ['./color-picker-dialog.component.scss'],
})

export class ColorPickerDialogComponent {

  private opacity: number;
  private selectedColor: string;
  private hue: string;
  private modalManager = ModalManagerSingleton.getInstance();

  constructor(private dialogRef: MatDialogRef<ColorPickerDialogComponent>, protected colorService: ColorService,
              @Inject(MAT_DIALOG_DATA) private data: DialogData) {
                this.modalManager._isModalActive = true;
                this.afterClose();
               }

  close(): void {
    this.dialogRef.close();
  }

  set _opacity(opacity: number) {
    if (0 <= opacity && opacity <= 1) {
      this.opacity = opacity;
    }
  }

  get _opacity(): number {
    return this.opacity;
  }

  get _selectedColor(): string {
    return this.selectedColor;
  }

  get _hue(): string {
    return this.hue;
  }

  isColorModified(): boolean {
    return (this._selectedColor !== undefined );
  }

  isOpacityModified(): boolean {
    return (this._opacity !== undefined );
  }

  onColorSelected(selectedColor: string) {
    this.selectedColor = selectedColor;
  }

  onHuePropertySelected(hue: string) {
    this.hue = hue;
  }

  submit(): void {
    if (!this.isColorModified()) {
      this.selectedColor = this.data.color;
    }
    const modifiedColor = this.modifyColorOpacity();
    this.dialogRef.close(modifiedColor);
    this.modalManager._isModalActive = false;
  }

  modifyColorOpacity(): string {
    if (this.opacity) {
      this.selectedColor = this.selectedColor.slice(0, -2) + this.opacity + ')';
      return this.selectedColor;
    }
    return this.selectedColor;
  }
  afterClose(): void {
    this.dialogRef.afterClosed().subscribe(() => {
      this.modalManager._isModalActive = false;
    });
  }
}
