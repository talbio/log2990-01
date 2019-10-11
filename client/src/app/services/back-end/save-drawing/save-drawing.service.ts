import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {ToolManagerService} from '../../tools/tool-manager/tool-manager.service';
import {Drawing} from "../../../../../../common/communication/Drawing";

@Injectable({
  providedIn: 'root',
})
export class SaveDrawingService {

  private readonly HTTP_OPTIONS = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
    }),
  };

  private readonly BASE_URL: string = 'http://localhost:3000/api/drawings/';

  private svgCanvas: any;

  constructor(private toolManager: ToolManagerService,
              private httpClient: HttpClient) {}

  set _svgCanvas(svgCanvas: any) {
    this.svgCanvas = svgCanvas;
  }

  httpPostDrawing(name: string, tags: string[]): Promise<void> {
    const svgElements: string = this.getSvgElements();
    const miniature: string = this.getMiniature();
    const drawing: Drawing = {name, svgElements, tags, miniature};
    return this.httpClient.post<Drawing>(this.BASE_URL, {data: drawing}, this.HTTP_OPTIONS).toPromise().then(() => {
      this.toolManager.deleteAllDrawings();
    }).catch((err: HttpErrorResponse) => {
      console.error('An error occurred:', err.error);
    });
  }

  getSvgElements(): string {
    const patternsEndDef = '</defs>';
    const startIndex = this.svgCanvas.innerHTML.search(patternsEndDef) + patternsEndDef.length;
    return this.svgCanvas.innerHTML.substring(startIndex);
  }

  getMiniature(): string {
    return '';
  }
}
