import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { ColorService } from 'src/app/services/tools/color/color.service';

@Component({
  selector: 'app-color-picker-dialog',
  templateUrl: './color-picker-dialog.component.html',
  styleUrls: ['./color-picker-dialog.component.scss'],
})
export class ColorPickerDialogComponent  {

    constructor(private dialogRef: MatDialogRef<ColorPickerDialogComponent>, protected colorService: ColorService) {}

    close(): void {
      this.dialogRef.close();
      }
}
