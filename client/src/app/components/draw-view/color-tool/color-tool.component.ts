import { ToolManagerService } from './../../../services/tools/tool-manager/tool-manager.service';
import { Component, Input, OnInit  } from '@angular/core';
import { MatDialog } from '@angular/material';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ColorPickerDialogComponent } from '../../modals/color-picker-dialog/color-picker-dialog.component';

@Component({
  selector: 'app-color-tool',
  templateUrl: './color-tool.component.html',
  styleUrls: ['./color-tool.component.scss'],
})
export class ColorToolComponent implements OnInit {
  @Input()
    color: string;

  primaryColor: string;
  secondaryColor: string;
  primaryTransparency: number;
  secondaryTransparency: number;

  constructor( private storage: StorageService, public dialog: MatDialog, private toolManager: ToolManagerService) {
  }

  ngOnInit() {
    this.primaryColor = this.assignPrimaryColor();
    this.secondaryColor = this.assignSecondaryColor();
    this.primaryTransparency = this.secondaryTransparency = 1;
  }

  openDialog(colorToModify: string): void {
    const dialogRef = this.dialog.open( ColorPickerDialogComponent, {
      height: '300px',
      width: '500px',
    });
    dialogRef.afterClosed().subscribe( (selectedColor) => {
      if (colorToModify === 'primary') {
      this.primaryColor = selectedColor;
      this.storage.setPrimaryColor(selectedColor);
      this.toolManager.primaryColor = selectedColor;
      }
      if (colorToModify === 'secondary') {
        this.secondaryColor = selectedColor;
        this.storage.setSecondaryColor(selectedColor);
        this.toolManager.secondaryColor = selectedColor;
        }
    });
  }

  assignPrimaryColor(): string {
    const color = this.storage.getPrimaryColor();
    if (color !== 'empty') {
      this.toolManager.primaryColor = this.storage.getPrimaryColor();
      return this.storage.getPrimaryColor();
    }
    this.storage.setPrimaryColor('#ffffffff');
    this.toolManager.primaryColor = '#ffffffff';
    return '#ffffffff';
  }

  assignSecondaryColor(): string {
    const color = this.storage.getSecondaryColor();
    if (color !== 'empty') {
      this.toolManager.secondaryColor = this.storage.getSecondaryColor()
      return this.storage.getSecondaryColor();
    }
    this.storage.setSecondaryColor('#000000ff');
    this.toolManager.secondaryColor = '#000000ff';
    return '#000000ff';
  }

  switchMainColors(): void {
    const temp = this.primaryColor;
    this.primaryColor = this.secondaryColor;
    this.secondaryColor = temp;
    this.storage.setPrimaryColor(this.primaryColor);
    this.storage.setSecondaryColor(this.secondaryColor);
  }

  modifyPrimaryColorTransparency(transparency: number) {
    this.primaryTransparency = transparency;
  }

}
