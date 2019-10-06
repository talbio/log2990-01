import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {ToolManagerService} from '../../tools/tool-manager/tool-manager.service';

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

  postSvgElements(): Promise<void> {
    const svgElementsInJsonFormat = this.svgToJson();
    return this.httpClient.post<string>(this.BASE_URL, {data: svgElementsInJsonFormat}, this.HTTP_OPTIONS).toPromise().then(() => {
      this.toolManager.deleteAllDrawings();
    }).catch((err: HttpErrorResponse) => {
      console.error('An error occurred:', err.error);
    });
  }

  svgToJson(): string {
    const patternsEndDef = '</defs>';
    const startIndex = this.svgCanvas.innerHTML.search(patternsEndDef) + patternsEndDef.length;
    return this.svgCanvas.innerHTML.substring(startIndex);
  }
}
