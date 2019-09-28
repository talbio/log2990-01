
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


  constructor(protected colorService: ColorService, public dialog: MatDialog) { }

  openDialog(colorToModify: string): void {
    const dialogRef = this.dialog.open(ColorPickerDialogComponent, {
      height: '300px',
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((selectedColor) => {
      if(selectedColor !== undefined){
      this.colorService.addToTopTenColors(selectedColor);
      if (colorToModify === 'primary') {
        this.colorService.primaryColor = selectedColor;
        this.colorService.setPrimaryColor(selectedColor);
      }
      if (colorToModify === 'secondary') {
        this.colorService.secondaryColor = selectedColor;
        this.colorService.setSecondaryColor(selectedColor);
      }
    }
    });
  }

}
