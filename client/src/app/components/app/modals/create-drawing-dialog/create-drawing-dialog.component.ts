import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-create-drawing-dialog',
  templateUrl: './create-drawing-dialog.component.html',
  styleUrls: ['./create-drawing-dialog.component.scss'],
})
export class CreateDrawingDialogComponent implements OnInit {
  protected createDrawingForm: FormGroup;
  protected dialogTitle = 'Créer un nouveau dessin';
  protected width = 100;
  protected height = 100;
  protected hexColor = '#FFFFFF';

  constructor() {
    this.createDrawingForm = new FormGroup({
      height: new FormControl(Validators.min(0)),
      width: new FormControl(Validators.min(0)),
      hexColor: new FormControl(),
    });
  }

  ngOnInit() {
  }

  close() {
  }

  save() {
  }
}
