import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ColorToolComponent } from '../color-tool/color-tool.component';

@Component({
  selector: 'app-lateral-bar',
  templateUrl: './lateral-bar.component.html',
  styleUrls: ['./lateral-bar.component.scss']
})
export class LateralBarComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }

  openColorTool(): void {
    this.dialog.open(ColorToolComponent, {width: '500px', height: '500px'});
  }

}
