import {COMMA, ENTER, SPACE} from '@angular/cdk/keycodes';
import {Component, Inject, OnInit} from '@angular/core';
import {MatChipInputEvent} from '@angular/material/chips';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { ToolManagerService } from 'src/app/services/tools/tool-manager/tool-manager.service';
import { Drawing } from '../../../../../../common/communication/Drawing';
import {SaveDrawingService} from '../../../services/back-end/save-drawing/save-drawing.service';
import {RendererLoaderService} from '../../../services/renderer-loader/renderer-loader.service';
import {GiveUpChangesDialogComponent} from '../give-up-changes-dialog/give-up-changes-dialog.component';
import { ModalManagerSingleton } from '../modal-manager-singleton';

export interface DialogData {
  drawingNonEmpty: boolean;
}

@Component({
  selector: 'app-open-list-drawings-server',
  templateUrl: './open-drawing-dialog.component.html',
  styleUrls: ['./open-drawing-dialog.component.scss'],
})
export class OpenDrawingDialogComponent implements OnInit {

  protected drawings: Drawing[];
  private modalManagerSingleton = ModalManagerSingleton.getInstance();

  selectedTags: any[];

  // visible = true;
  // selectable = true;
  // removable = true;
  // addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];

  constructor(private dialogRef: MatDialogRef<OpenDrawingDialogComponent>,
              private toolManager: ToolManagerService,
              private saveDrawing: SaveDrawingService,
              private rendererLoadService: RendererLoaderService,
              private dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) private data: DialogData) {

    this.modalManagerSingleton._isModalActive = true;
    this.drawings = [];
    this.selectedTags = [];
  }

  ngOnInit() {
    this.saveDrawing.httpGetDrawing().toPromise().then( (drawings: Drawing[]) => {
      if (drawings) {
        this.drawings = drawings;
      }
    });
  }

  addSelectedTag(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.selectedTags.push(value.trim());
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeSelectedTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
    }
  }

  async openDrawing(drawing: Drawing): Promise<void> {
    if (this.data.drawingNonEmpty) {
      this.openGiveUpChangesDialog()
        .then( (confirm: boolean) => {
          if (confirm) {
            this.loadDrawingAndCloseDialog(drawing);
          }
        });
    } else {
      this.loadDrawingAndCloseDialog(drawing);
    }
  }

  protected close(): void {
    this.dialogRef.close();
    this.modalManagerSingleton._isModalActive = false;
  }

  private loadDrawingAndCloseDialog(drawing: Drawing) {
    this.toolManager.deleteAllDrawings();
    const svgCanvas = this.rendererLoadService._renderer.selectRootElement('#canvas', true);
    svgCanvas.innerHTML += drawing.svgElements;
    // TODO: synchronize nb of elements.
    this.close();
  }

  private async openGiveUpChangesDialog(): Promise<boolean> {
    let confirm = false;
    const dialogRef = this.dialog.open(GiveUpChangesDialogComponent);
    await dialogRef.afterClosed().toPromise().then((confirmResult) => confirm = confirmResult);
    return confirm;
  }

}
