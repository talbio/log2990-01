import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {CreateDrawingDialogComponent} from '../../app/modals/create-drawing-dialog/create-drawing-dialog.component';

@Component({
  selector: 'app-lateral-bar',
  templateUrl: './lateral-bar.component.html',
  styleUrls: ['./lateral-bar.component.scss'],
})
export class LateralBarComponent implements OnInit {

  // TODO: this boolean has to be moved to a service which will keep track of the drawings of the current drawing.
  // set to true for testing purposes
  private drawingNonEmpty = true;

  constructor(private dialog: MatDialog) {
  }

  ngOnInit() {
  }

  openCreateDrawingDialog() {
    const dialogRef = this.dialog.open(CreateDrawingDialogComponent, {
      autoFocus: false,
      data: this.drawingNonEmpty,
    });

    dialogRef.afterClosed().subscribe((formResult) => console.log(formResult));
  }

}
