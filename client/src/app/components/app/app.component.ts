import {Component} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {CreateDrawingDialogComponent} from './modals/create-drawing-dialog/create-drawing-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly title: string = 'dessin';

  constructor(private dialog: MatDialog) {}

  openDialog() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;

    this.dialog.open(CreateDrawingDialogComponent, dialogConfig);
  }
}
