import { Component, Inject, OnInit} from '@angular/core';
import {  MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToolManagerService } from 'src/app/services/tools/tool-manager/tool-manager.service';
import { Drawing } from '../../../../../../common/communication/Drawing';
import {SaveDrawingService} from '../../../services/back-end/save-drawing/save-drawing.service';
import { GiveUpChangesDialogComponent } from '../give-up-changes-dialog/give-up-changes-dialog.component';
import { ModalManagerSingleton } from '../modal-manager-singleton';



export interface DialogData {
  drawingNonEmpty: boolean;
}

@Component({
  selector: 'app-open-list-drawings-server',
  templateUrl: './open-list-drawings-server.component.html',
  styleUrls: ['./open-list-drawings-server.component.scss']
})
export class OpenListDrawingsServerComponent implements OnInit {
  protected readonly DIALOG_TITLE = 'Ouvrir un dessin';
  drawings: Drawing[] = [];
  private modalManager = ModalManagerSingleton.getInstance();
  constructor(private dialogRef: MatDialogRef<OpenListDrawingsServerComponent>,
              private dialog: MatDialog,
              private toolManager: ToolManagerService,
              private saveDrawing: SaveDrawingService,
              @Inject(MAT_DIALOG_DATA) private data: DialogData) {
                this.modalManager._isModalActive = true;
              }

  ngOnInit() {
    this.saveDrawing.httpGetDrawing().toPromise().then( (d: Drawing[]) => {
      this.drawings = d;
      console.log(this.drawings);
      console.log(this.drawings[0].svgElements);

    });
  }

  close(): void {
    this.dialogRef.close();
    this.modalManager._isModalActive = false;
  }

  async submit(): Promise<void> {
    if (this.data.drawingNonEmpty) {
      await this.openConfirmGiveUpChangesDialog().then((confirm) => {
        if (confirm) {
          this.toolManager.deleteAllDrawings();
          this.dialogRef.close();
          this.modalManager._isModalActive = false;
        }
      });
    } else {
      this.dialogRef.close();
      this.modalManager._isModalActive = false;
    }
  }

  private async openConfirmGiveUpChangesDialog(): Promise<boolean> {
    let confirm = false;
    const dialogRef = this.dialog.open(GiveUpChangesDialogComponent);
    await dialogRef.afterClosed().toPromise().then((confirmResult) => confirm = confirmResult);
    return confirm;
  }

}
