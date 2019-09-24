import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-give-up-changes-dialog',
  templateUrl: './confirm-give-up-changes-dialog.component.html',
  styleUrls: ['./confirm-give-up-changes-dialog.component.scss']
})
export class ConfirmGiveUpChangesDialogComponent implements OnInit {
  protected confirm: boolean;

  constructor(private dialogRef: MatDialogRef<ConfirmGiveUpChangesDialogComponent>) {
    this.confirm = false;
  }

  // tslint:disable-next-line:no-empty
  ngOnInit(): void {}

  close() {
    this.dialogRef.close(this.confirm);
  }

}
