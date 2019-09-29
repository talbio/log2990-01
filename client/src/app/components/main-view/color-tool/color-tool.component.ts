
import { Component } from '@angular/core';
import { ColorService } from 'src/app/services/tools/color/color.service';
import { MatDialog } from '@angular/material';
import { ColorPickerDialogComponent } from '../../modals/color-picker-module/color-picker-dialog/color-picker-dialog.component';



@Component({
  selector: 'app-color-tool',
  templateUrl: './color-tool.component.html',
  styleUrls: ['./color-tool.component.scss'],
})
export class ColorToolComponent {

  constructor(protected colorService: ColorService, public dialog: MatDialog) {
  }

  openDialog(colorToModify: string): void {
    const dialogRef = this.dialog.open(ColorPickerDialogComponent)

     dialogRef.afterClosed().subscribe((color) => {
      if (color) {
        //let colorSelected = this.modifyOpacity(this.colorService.colorSelected, data)
        this.colorService.addToTopTenColors(color);
        if (colorToModify === 'primary') {
          this.colorService.primaryColor = color;
          this.colorService.setPrimaryColor(color);
        }
        if (colorToModify === 'secondary') {
          this.colorService.secondaryColor = color;
          this.colorService.setSecondaryColor(color);
        }
      }
    });
  }

  // modifyOpacity(colorSelected: string, opacity: number): string {
  //   if (colorSelected !== undefined) {
  //     colorSelected = colorSelected.slice(0, -2) + opacity + ')';
  //     return colorSelected;
  //   }
  //   return colorSelected;
  // }
}
