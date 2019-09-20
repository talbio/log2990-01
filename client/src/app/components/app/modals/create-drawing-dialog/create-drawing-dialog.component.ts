import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-drawing-dialog',
  templateUrl: './create-drawing-dialog.component.html',
  styleUrls: ['./create-drawing-dialog.component.scss'],
})
export class CreateDrawingDialogComponent implements OnInit {
  protected createDrawingForm: FormGroup;
  protected dialogTitle = 'Créer un nouveau dessin';
  protected width: number;
  protected height: number;
  protected hexColor = '#FFFFFF';

  constructor(public dialogRef: MatDialogRef<CreateDrawingDialogComponent>) {
    this.createDrawingForm = new FormGroup({
      height: new FormControl(Validators.min(0)),
      width: new FormControl(Validators.min(0)),
      hexColor: new FormControl(),
    });
  }

  ngOnInit() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    // TODO: send the attributes of the new drawing to a service which will create the drawing
    this.dialogRef.close();
  }
}
