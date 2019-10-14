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

  constructor(protected colorService: ColorService,
              private dialog: MatDialog) {
  }

  openDialogForPrimaryColor(): void {
    const dialogRef = this.dialog.open(ColorPickerDialogComponent,
      { data: { color: this.colorService.getPrimaryColor() }, disableClose: true, });
    dialogRef.afterClosed().subscribe((colorSelectedByUser) => {
      if (colorSelectedByUser) {
        this.colorService.addToTopTenColors(colorSelectedByUser);
        this.colorService.primaryColor = colorSelectedByUser;
        this.colorService.setPrimaryColor(colorSelectedByUser);
      }
    });
  }

  openDialogForSecondaryColor(): void {
    const dialogRef = this.dialog.open(ColorPickerDialogComponent,
      { data: { color: this.colorService.getSecondaryColor() }, disableClose: true, });
    dialogRef.afterClosed().subscribe((colorSelectedByUser) => {
      if (colorSelectedByUser) {
        this.colorService.addToTopTenColors(colorSelectedByUser);
        this.colorService.secondaryColor = colorSelectedByUser;
        this.colorService.setSecondaryColor(colorSelectedByUser);
      }
    });
  }

}
