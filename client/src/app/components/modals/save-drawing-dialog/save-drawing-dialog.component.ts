import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-save-drawing-dialog',
  templateUrl: './save-drawing-dialog.component.html',
  styleUrls: ['./save-drawing-dialog.component.scss']
})
export class SaveDrawingDialogComponent implements OnInit {

  protected readonly DIALOG_TITLE = 'Sauvegarder votre dessin';
  protected readonly NON_EMPTY_NAME_ERR_MSG = 'nom obligatoire';
  protected readonly TAGS_INVALID_ERR_MSG = 'tags invalides';

  protected formGroup: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private dialogRef: MatDialogRef<SaveDrawingDialogComponent>) {

    this.formGroup = this.formBuilder.group({
      name: ['', [
        Validators.required,
      ]],
      tags: ['', [
        // TODO: qu'est ce qu'un tag valide?
        Validators.pattern('^[0-9]*$'),
      ]],
    });
  }

  ngOnInit() {
  }

  get name(): AbstractControl {
    return this.formGroup.get('name') as AbstractControl;
  }

  get tags(): AbstractControl {
    return this.formGroup.get('tags') as AbstractControl;
  }

  empty(abstractControl: AbstractControl): boolean {
    return abstractControl.value === '';
  }

  close() {
    this.dialogRef.close();
  }

  submit() {
  }

}
