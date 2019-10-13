import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Injectable, Renderer2} from '@angular/core';
import { Observable, of } from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Drawing} from '../../../../../../common/communication/Drawing';
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
  private renderer: Renderer2;

  constructor(private toolManager: ToolManagerService,
              private httpClient: HttpClient) {}

  set _renderer(renderer: Renderer2) {
    this.renderer = renderer;
    this.svgCanvas = this.renderer.selectRootElement('#canvas', true);
  }

  httpPostDrawing(name: string, tags: string[]): Promise<void> {
    const svgElements: string = this.getSvgElements();
    const miniature: string = this.getMiniature();
    const drawing: Drawing = {name, svgElements, tags, miniature};
    return this.httpClient.post<{data: Drawing}>(this.BASE_URL, {data: drawing}, this.HTTP_OPTIONS).toPromise().then(() => {
      this.toolManager.deleteAllDrawings();
    }).catch( (success: Response) => {
      if (success.status === 400) {
        console.error('httpPostDrawing failed: name was not valid');
      }
      this.toolManager.deleteAllDrawings();
    }).catch((err: HttpErrorResponse) => {
      console.error('httpPostDrawing failed: ', err.error);
    });
  }

  httpGetDrawing(): Observable<Drawing> {

    return this.httpClient.get<Drawing>(this.BASE_URL).pipe(
      catchError(this.handleError<Drawing>('httpGetDrawing')),
    );
  }

  private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {

    return (error: Error): Observable<T> => {
      return of(result as T);
    };
  }

  getWidth(): number {
    return this.svgCanvas.getAttribute('height');
  }

  getHeight(): number {
    return this.svgCanvas.getAttribute('width');
  }

  getSvgElements(): string {
    const patternsEndDef = '</defs>';
    const startIndex = this.svgCanvas.innerHTML.search(patternsEndDef) + patternsEndDef.length;
    return this.svgCanvas.innerHTML.substring(startIndex);
  }

  getMiniature(): string {
    const miniature = this.renderer.selectRootElement('#min', true);
    return miniature.outerHTML as string;
  }
}
