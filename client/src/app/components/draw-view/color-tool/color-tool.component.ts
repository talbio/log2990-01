import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-color-tool',
  templateUrl: './color-tool.component.html',
  styleUrls: ['./color-tool.component.scss']
})
export class ColorToolComponent implements OnInit {
  primaryColor: string;
  secondaryColor: string;
  topTenColors: string[];

  constructor(private dialogRef: MatDialogRef<ColorToolComponent>, private storage: StorageService) {
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
      return this.storage.getPrimaryColor();
    }
    this.storage.setPrimaryColor('white');
    return 'white';
  }

  assignSecondaryColor(): string {
    const color = this.storage.getPrimaryColor();
    if (typeof color !== 'undefined' && color !== null) {
      return this.storage.getSecondaryColor();
    }
    this.storage.setSecondaryColor('black');
    return 'black';
  }

  switchMainColors(): void {
    const temp = this.primaryColor;
    this.primaryColor = this.secondaryColor;
    this.secondaryColor = temp;
    this.storage.setPrimaryColor(this.primaryColor);
    this.storage.setSecondaryColor(this.secondaryColor);
  }

  selectColor(color: string): void {
    debugger
    this.primaryColor = color;
    this.storage.setPrimaryColor(color);
  }

}
