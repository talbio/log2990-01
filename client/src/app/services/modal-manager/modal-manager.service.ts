import {Injectable, Renderer2} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { OpenDrawingDialogComponent } from 'src/app/components/modals/open-drawing-dialog/open-drawing-dialog.component';
import {ColorPickerDialogComponent} from '../../components/modals/color-picker-module/color-picker-dialog/color-picker-dialog.component';
import {CreateDrawingDialogComponent} from '../../components/modals/create-drawing-dialog/create-drawing-dialog.component';
import {SaveDrawingDialogComponent} from '../../components/modals/save-drawing-dialog/save-drawing-dialog.component';
import {CreateDrawingFormValues} from '../../data-structures/CreateDrawingFormValues';
import {ColorService} from '../tools/color/color.service';
import {ToolManagerService} from '../tools/tool-manager/tool-manager.service';
import {GiveUpChangesDialogComponent} from "../../components/modals/give-up-changes-dialog/give-up-changes-dialog.component";

export enum Color {
  primaryColor,
  secondaryColor,
}

@Injectable({
  providedIn: 'root',
})
export class ModalManagerService {

  private renderer: Renderer2;

  constructor(private dialog: MatDialog,
              private toolManager: ToolManagerService,
              protected colorService: ColorService) {
  }

  loadRenderer(renderer: Renderer2) {
    this.renderer = renderer;
  }

  showCreateDrawingDialog(): void {
      const dialogRef = this.dialog.open(CreateDrawingDialogComponent, {
        autoFocus: false,
        data: {drawingNonEmpty: this.toolManager.drawingNonEmpty()},
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((formValues: CreateDrawingFormValues) => {
        if (formValues) {
          const svgCanvas = this.renderer.selectRootElement('#canvas', true);
          this.renderer.setAttribute(svgCanvas, 'width', formValues.width.toString());
          this.renderer.setAttribute(svgCanvas, 'height', formValues.height.toString());
          this.renderer.setStyle(svgCanvas, 'background-color', formValues.color.toString());
        }
      });
  }

  showColorPickerDialog(color: Color): void {
    const dialogRef = this.dialog.open(ColorPickerDialogComponent,
      {
        data: { color: color === Color.primaryColor ? this.colorService.getPrimaryColor() : this.colorService.getSecondaryColor() },
        disableClose: true,
      });
    dialogRef.afterClosed().subscribe((colorSelectedByUser) => {
      if (colorSelectedByUser) {
        this.colorService.addToTopTenColors(colorSelectedByUser);
        if (color === Color.primaryColor) {
          this.colorService.primaryColor = colorSelectedByUser;
          this.colorService.setPrimaryColor(colorSelectedByUser);
        } else {
          this.colorService.secondaryColor = colorSelectedByUser;
          this.colorService.setSecondaryColor(colorSelectedByUser);
        }
      }
    });
  }

  showSaveDrawingDialog(): void {
    this.dialog.open(SaveDrawingDialogComponent, {
      autoFocus: false,
      data: {},
    });
  }

  showOpenDrawingDialog(): void {
    this.dialog.open(OpenDrawingDialogComponent, {
      autoFocus: false,
      data: {drawingNonEmpty: this.toolManager.drawingNonEmpty()},
      disableClose: true,
    });
  }

  showUserManualDialog(): void {
    return;
  }

}
