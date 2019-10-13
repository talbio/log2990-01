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
  protected readonly ALPHA_NUMERIC_REGEX = '^[a-zA-Z0-9_]*$';
  protected readonly ALPHA_NUMERIC_AND_SPACES_REGEX = /^[-\w\s]+$/;
  protected readonly DIALOG_TITLE = 'Sauvegarder votre dessin';
  protected readonly INVALID_NAME_ERR_MSG = 'nom invalide';
  protected readonly INVALID_TAG_ERR_MSG = `tag invalide`;

  protected formGroup: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private dialogRef: MatDialogRef<SaveDrawingDialogComponent>,
              protected saveDrawing: SaveDrawingService) {
    this.formGroup = this.formBuilder.group({
      name: ['', [
        Validators.pattern(this.ALPHA_NUMERIC_AND_SPACES_REGEX),
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
        Validators.pattern(this.ALPHA_NUMERIC_REGEX),
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
