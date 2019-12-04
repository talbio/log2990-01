import {AfterViewInit, Component, Renderer2} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import {DrawingsService} from '../../../services/drawings/drawings.service';
import {ModalManagerSingleton} from '../modal-manager-singleton';

@Component({
  selector: 'app-save-drawing-dialog',
  styleUrls: ['./save-drawing-dialog.component.scss'],
  templateUrl: './save-drawing-dialog.component.html',
})
export class SaveDrawingDialogComponent implements AfterViewInit {

  private static httpPosting: boolean;
  private static localPosting: boolean;
  private modalManagerSingleton = ModalManagerSingleton.getInstance();

  protected readonly NO_SPACES_REGEX = /^\S*$/;
  protected readonly ALPHA_NUMERIC_REGEX = '^[a-zA-Z0-9_]*$';
  protected readonly ALPHA_NUMERIC_AND_SPACES_REGEX = /^[-\w\s]+$/;
  protected readonly DIALOG_TITLE = 'Sauvegarder votre dessin';
  protected readonly INVALID_NAME_ERR_MSG = 'nom invalide';
  protected readonly INVALID_TAG_ERR_MSG = `tag invalide`;
  protected readonly HTTP_POST_DRAWING_FAILED_MSG = 'La sauvegarde du dessin a échoué! Veuillez réessayer.';
  protected readonly HTTP_POST_DRAWING_SUCCEEDED_MSG = 'Votre dessin a bien été sauvegardé!';
  protected readonly LOCAL_POST_DRAWING_FAILED_MSG = 'La sauvegarde du dessin a échoué! Veuillez réessayer.';
  protected readonly LOCAL_POST_DRAWING_SUCCEEDED_MSG = `Votre dessin a bien été sauvegardé!`;

  protected httpPostDrawingFailed: boolean;
  protected formGroup: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private dialogRef: MatDialogRef<SaveDrawingDialogComponent>,
              private drawingsService: DrawingsService,
              private notifier: NotifierService,
              private renderer: Renderer2) {
    this.formGroup = this.formBuilder.group({
      name: ['', [
        Validators.pattern(this.ALPHA_NUMERIC_AND_SPACES_REGEX),
        Validators.required,
      ]],
      tags: this.formBuilder.array([]),
    });
    this.httpPostDrawingFailed = false;
    this.modalManagerSingleton._isModalActive = true;
    this.afterClose();
  }

  ngAfterViewInit(): void {
    // set the miniature
    const min = this.renderer.selectRootElement('#min', true);
    const canvas = this.renderer.selectRootElement('#canvas', true);
    const width = canvas.getAttribute('width');
    const height = canvas.getAttribute('height');
    const viewBox = `0 0 ${width} ${height}`;
    this.renderer.setAttribute(min, 'viewBox', viewBox);
    min.innerHTML = canvas.innerHTML;
  }

  get isPostingToServer() {
    return SaveDrawingDialogComponent.httpPosting;
  }

  get isPostingLocally() {
    return SaveDrawingDialogComponent.localPosting;
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

  close() {
    this.dialogRef.close();
  }

  async submit() {
    const tags: string[] = [];
    for (const tagFormControl of this.tags.value) {
      tags.push(tagFormControl.tag);
    }
    SaveDrawingDialogComponent.httpPosting = true;
    await this.drawingsService.httpPostDrawing(this.name.value, tags)
      .then(
        (success: boolean) => {
          if (success) {
            this.notifier.notify('success', this.HTTP_POST_DRAWING_SUCCEEDED_MSG);
            this.close();
            return Promise.resolve();
          } else {
            return Promise.reject(success);
          }
        },
        (error) => {
          return Promise.reject(error);
        })
      .catch( (_) => {
        this.notifier.notify('error', this.HTTP_POST_DRAWING_FAILED_MSG);
      })
      .finally(() => SaveDrawingDialogComponent.httpPosting = false);
  }
  async submitLocal() {
    const tags: string[] = [];
    for (const tagFormControl of this.tags.value) {
      tags.push(tagFormControl.tag);
    }
    SaveDrawingDialogComponent.localPosting = true;
    await this.drawingsService.localPostDrawing(this.name.value, tags)
      .then(
        (success: boolean) => {
          if (success) {
            this.notifier.notify('success', this.LOCAL_POST_DRAWING_SUCCEEDED_MSG);
            this.close();
            return Promise.resolve();
          } else {
            return Promise.reject(success);
          }
        },
        (error) => {
          return Promise.reject(error);
      })
      .catch( (_) => {
        this.notifier.notify('error', this.LOCAL_POST_DRAWING_FAILED_MSG);
      })
      .finally(() => SaveDrawingDialogComponent.localPosting = false);
  }
  afterClose(): void {
    this.dialogRef.afterClosed().subscribe(() => {
      this.modalManagerSingleton._isModalActive = false;
    });
  }
}
