
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ColorService } from 'src/app/services/tools/color/color.service';
import { ColorPickerDialogComponent } from '../../modals/color-picker-module/color-picker-dialog/color-picker-dialog.component';

@Component({
  selector: 'app-color-tool',
  templateUrl: './color-tool.component.html',
  styleUrls: ['./color-tool.component.scss'],
})
export class ColorToolComponent {

  constructor(protected colorService: ColorService, public dialog: MatDialog) {
  }

  openDialogForPrimaryColor(): void {
    const dialogRef = this.dialog.open(ColorPickerDialogComponent);
    dialogRef.afterClosed().subscribe((color) => {
      if (color) {
        this.colorService.addToTopTenColors(color);
        this.colorService.primaryColor = color;
        this.colorService.setPrimaryColor(color);
      }
    });
  }

  openDialogForSecondaryColor(): void {
    const dialogRef = this.dialog.open(ColorPickerDialogComponent);
    dialogRef.afterClosed().subscribe((color) => {
      if (color) {
        this.colorService.addToTopTenColors(color);
        this.colorService.secondaryColor = color;
        this.colorService.setSecondaryColor(color);
      }
    });
  }

}
