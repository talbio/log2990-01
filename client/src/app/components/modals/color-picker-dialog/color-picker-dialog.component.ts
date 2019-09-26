import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-color-picker-dialog',
  templateUrl: './color-picker-dialog.component.html',
  styleUrls: ['./color-picker-dialog.component.scss'],
})
export class ColorPickerDialogComponent  {

    topTenColors = ['blue', 'white', 'red', 'black', 'orange', 'yellow', 'green', 'brown', 'lime', 'beige'];

    constructor(private dialogRef: MatDialogRef<ColorPickerDialogComponent>) {}

    close(): void {
        this.dialogRef.close();
      }
}
