import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-drawing-dialog',
  templateUrl: './create-drawing-dialog.component.html',
  styleUrls: ['./create-drawing-dialog.component.scss'],
})
export class CreateDrawingDialogComponent implements OnInit {
  protected drawingForm: FormGroup;
  protected dialogTitle = 'Créer un nouveau dessin';

  constructor(public dialogRef: MatDialogRef<CreateDrawingDialogComponent>) {
  }

  ngOnInit() {
    this.drawingForm = new FormGroup({
      height: new FormControl('100', [Validators.required, Validators.min(0)]),
      width: new FormControl('100', [Validators.required, Validators.min(0)]),
      hexColor: new FormControl('#FFFFFF', [Validators.required]),
    });
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.drawingForm.value);
  }

}
