import {Component} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {SaveDrawingService} from '../../../services/back-end/save-drawing/save-drawing.service';

@Component({
  selector: 'app-save-drawing-dialog',
  templateUrl: './save-drawing-dialog.component.html',
  styleUrls: ['./save-drawing-dialog.component.scss'],
})
export class SaveDrawingDialogComponent {

  private static httpPosting: boolean;

  protected readonly NO_SPACES_REGEX = /^\S*$/;
  protected readonly DIALOG_TITLE = 'Sauvegarder votre dessin';
  protected readonly NON_EMPTY_NAME_ERR_MSG = 'nom obligatoire';
  protected readonly TAGS_INVALID_ERR_MSG = `champ requis (sans espace)`;

  protected formGroup: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private dialogRef: MatDialogRef<SaveDrawingDialogComponent>,
              protected saveDrawing: SaveDrawingService) {
    this.formGroup = this.formBuilder.group({
      name: ['', [
        Validators.required,
      ]],
      tags: this.formBuilder.array([]),
    });
  }

  get isPostingToServer() {
    return SaveDrawingDialogComponent.httpPosting;
  }

  get name(): AbstractControl {
    return this.formGroup.get('name') as AbstractControl;
  }

  get tags(): FormArray {
    return this.formGroup.get('tags') as FormArray;
  }

  addTag(): void  {
    const tagFormControl = this.formBuilder.group({
      tag: ['', [
        Validators.pattern(this.NO_SPACES_REGEX),
        Validators.required,
      ]],
    });
    this.tags.push(tagFormControl);
  }

  deleteTag(index: number): void {
    this.tags.removeAt(index);
  }

  empty(abstractControl: AbstractControl): boolean {
    return abstractControl.value === '';
  }

  close() {
    this.dialogRef.close();
  }

  async submit() {
    const tags: string[] = [];
    for (const tagFormControl of this.tags.value) {
      tags.push(tagFormControl.tag);
    }
    SaveDrawingDialogComponent.httpPosting = true;
    await this.saveDrawing.httpPostDrawing(this.name.value, tags);
    SaveDrawingDialogComponent.httpPosting = false;
    this.dialogRef.close();
  }

}
