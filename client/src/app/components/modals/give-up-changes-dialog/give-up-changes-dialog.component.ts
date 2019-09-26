import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-give-up-changes-dialog',
  templateUrl: './give-up-changes-dialog.component.html',
  styleUrls: ['./give-up-changes-dialog.component.scss'],
})
export class GiveUpChangesDialogComponent implements OnInit {
  protected confirm: boolean;

  constructor(private dialogRef: MatDialogRef<GiveUpChangesDialogComponent>) {
    this.confirm = false;
  }

  // tslint:disable-next-line:no-empty
  ngOnInit(): void {}

  close() {
    this.dialogRef.close(this.confirm);
  }

}
