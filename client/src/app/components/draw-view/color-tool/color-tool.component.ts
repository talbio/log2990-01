
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


  constructor(protected colorModifier: ColorService, public dialog: MatDialog) { }

  openDialog(colorToModify: string): void {
    const dialogRef = this.dialog.open(ColorPickerDialogComponent, {
      height: '300px',
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((selectedColor) => {
      if (colorToModify === 'primary') {
        this.colorModifier.primaryColor = selectedColor;
        this.colorModifier.setPrimaryColor(selectedColor);
        //this.toolManager.primaryColor = selectedColor;
      }
      if (colorToModify === 'secondary') {
        this.colorModifier.secondaryColor = selectedColor;
        this.colorModifier.setSecondaryColor(selectedColor);
        //     this.colorModifier.toolManager.secondaryColor = selectedColor;
      }
    });
  }

}
