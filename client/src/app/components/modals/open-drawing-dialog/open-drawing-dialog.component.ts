import {COMMA, ENTER, SPACE} from '@angular/cdk/keycodes';
import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {MatChipInputEvent} from '@angular/material/chips';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { ToolManagerService } from 'src/app/services/tools/tool-manager/tool-manager.service';
import { Drawing } from '../../../../../../common/communication/Drawing';
import {DrawingsService} from '../../../services/back-end/drawings/drawings.service';
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

  protected readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];

  protected selectedTags: string[];
  protected drawings: Drawing[];

  private modalManagerSingleton = ModalManagerSingleton.getInstance();

  constructor(private dialogRef: MatDialogRef<OpenDrawingDialogComponent>,
              private toolManager: ToolManagerService,
              private drawingsService: DrawingsService,
              private dialog: MatDialog,
              private renderer: Renderer2,
              @Inject(MAT_DIALOG_DATA) private data: DialogData) {

    this.modalManagerSingleton._isModalActive = true;
    this.drawings = [];
    this.selectedTags = [];
  }

  ngOnInit() {
    this.drawingsService.httpGetDrawings().toPromise().then( (drawings: Drawing[]) => {
      if (drawings) {
        this.drawings = drawings;
      }
    });
  }

  addSelectedTag(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.selectedTags.push(value.trim());
    }

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
      await this.openGiveUpChangesDialog()
        .then( (confirm: boolean) => {
          if (confirm) {
            this.loadDrawingAndCloseDialog(drawing);
          }
        });
    } else {
      this.loadDrawingAndCloseDialog(drawing);
    }
  }

  async deleteDrawing(drawing: Drawing): Promise<void> {
    await this.drawingsService.httpDeleteDrawing(drawing.id).then( () => {
      const index = this.drawings.indexOf(drawing);
      if (index > -1) {
        this.drawings.splice(index, 1);
      }
    });
  }

  protected close(): void {
    this.dialogRef.close();
    this.modalManagerSingleton._isModalActive = false;
  }

  protected setMiniature(index: number): void {
    const miniature = this.renderer.selectRootElement('#miniature' + index);
    this.renderer.setAttribute(miniature, 'src', 'data:image/svg+xml;base64,' + window.btoa(this.drawings[index].miniature));
  }

  private loadDrawingAndCloseDialog(drawing: Drawing) {
    this.toolManager.deleteAllDrawings();
    const svgCanvas = this.renderer.selectRootElement('#canvas', true);
    svgCanvas.innerHTML = drawing.svgElements;
    this.toolManager.synchronizeAllCounters();
    this.close();
  }

  private async openGiveUpChangesDialog(): Promise<boolean> {
    let confirm = false;
    const dialogRef = this.dialog.open(GiveUpChangesDialogComponent);
    await dialogRef.afterClosed().toPromise().then((confirmResult) => confirm = confirmResult);
    return confirm;
  }
  // solution inspired from http://jsfiddle.net/Noitidart/zTe4j/3/
  openLocalDrawing(fileInput: HTMLInputElement) {
    // files is a FileList of File objects. List some properties.
    // let json = '';
    // const reader = new FileReader();

    // // Closure to capture the file information.
    // reader.onload = () => {
    //   return (e: { target: { result: string; }; }) =>  {
    //     console.log('e readAsText = ', e);
    //     console.log('e readAsText target = ', e.target);
    //     try {
    //       json = JSON.parse(e.target.result);
    //       alert('json global var has been set to parsed json of this file here it is unevaled = \n' + JSON.stringify(json));
    //     } catch (ex) {
    //       alert('ex when trying to parse json = ' + ex);
    //     }
    //   };
    // };
    // reader.readAsText(json);
  }
  checkJSONValidity() {
    //
  }
}
