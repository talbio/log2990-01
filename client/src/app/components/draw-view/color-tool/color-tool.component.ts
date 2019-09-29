
import { Component } from '@angular/core';
import { ColorService } from 'src/app/services/tools/color/color.service';
import { MatDialog } from '@angular/material';
import { ColorPickerDialogComponent } from '../../modals/color-picker-dialog/color-picker-dialog.component';



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
        //let color = this.modifyOpacity(this.colorService.color, data)
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

  // modifyOpacity(color: string, opacity: number): string {
  //   if (color !== undefined) {
  //     color = color.slice(0, -2) + opacity + ')';
  //     return color;
  //   }
  //   return color;
  // }
}
