import { Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-give-up-changes-dialog',
  templateUrl: './give-up-changes-dialog.component.html',
  styleUrls: ['./give-up-changes-dialog.component.scss'],
})
export class GiveUpChangesDialogComponent {

  constructor(private dialogRef: MatDialogRef<GiveUpChangesDialogComponent>) {
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected submit(): void {
    this.dialogRef.close(true);
  }
}
