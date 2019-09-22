import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-color-palette',
  templateUrl: './color-palette.component.html',
  styleUrls: ['./color-palette.component.scss']
})
export class ColorPaletteComponent implements OnInit {
  primaryColor: string;
  secondaryColor: string;
  topTenColors: string[];

  constructor(private dialogRef: MatDialogRef<ColorPaletteComponent>, private storage: StorageService) {
  }

  ngOnInit() {
    this.primaryColor = this.assignPrimaryColor();
    this.secondaryColor = this.assignSecondaryColor();
    this.topTenColors = ['blue', 'white', 'red', 'black', 'orange', 'yellow', 'green', 'brown', 'lime', 'beige'];
  }

  close(): void {
    this.dialogRef.close();
  }

  assignPrimaryColor(): string {
    const color = this.storage.getPrimaryColor();
    if (typeof color !== 'undefined' && color !== null) {
      this.storage.setPrimaryColor('white');
      return 'white';
    }
    return this.storage.getPrimaryColor();
  }

  assignSecondaryColor(): string {
    const color = this.storage.getPrimaryColor();
    if (typeof color !== 'undefined' && color !== null) {
      this.storage.setSecondaryColor('black');
      return 'black';
    }
    return this.storage.getSecondaryColor();
  }

  switchMainColors(): void {
    const temp = this.primaryColor;
    this.primaryColor = this.secondaryColor;
    this.secondaryColor = temp;
    this.storage.setPrimaryColor(this.primaryColor);
    this.storage.setSecondaryColor(this.secondaryColor);
  }

  selectColor(color: string): void {
    this.primaryColor = color;
    this.storage.setPrimaryColor(color);
  }

}
