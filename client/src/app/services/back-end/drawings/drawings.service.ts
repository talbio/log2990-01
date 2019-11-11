import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Drawing} from '../../../../../../common/communication/Drawing';
import {RendererSingleton} from '../../renderer-singleton';

@Injectable({
  providedIn: 'root',
})
export class DrawingsService {

  private readonly HTTP_OPTIONS = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
    }),
  };

  private readonly HTTP_CODE_SUCCESS = 200;
  private readonly BASE_URL: string = 'http://localhost:3000/api/drawings/';

  constructor(private httpClient: HttpClient) {}

  httpPostDrawing(name: string, tags: string[]): Promise<boolean> {
    const drawing: Drawing = this.makeDrawing(name, tags);
    return this.httpClient.post<{httpCode: number}>(this.BASE_URL, {data: drawing}, this.HTTP_OPTIONS)
      .toPromise()
      .then( (response: {httpCode: number}) => {
        return response.httpCode === this.HTTP_CODE_SUCCESS;
      })
      .catch((err: HttpErrorResponse) => {
        return this.handleError(err);
      });
  }

  httpGetDrawings(): Observable<Drawing[]> {
    return this.httpClient.get<Drawing[]>(this.BASE_URL).pipe(
      catchError(this.handleErrorGet<Drawing[]>('httpGetDrawings')),
    );
  }

  httpDeleteDrawing(id: number): Promise<boolean> {
    return this.httpClient.delete<boolean>(this.BASE_URL + id, this.HTTP_OPTIONS).toPromise();
  }

  private handleErrorGet<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
    console.error(error);
    return of(result as T);
    };
  }

  getSvgElements(): string {
    const svgCanvas: HTMLElement = RendererSingleton.renderer.selectRootElement('#canvas', true);
    return svgCanvas.innerHTML.substring(0);
  }

  getMiniature(): string {
    const miniature = RendererSingleton.renderer.selectRootElement('#min', true);
    return (new XMLSerializer()).serializeToString(miniature);
  }

  getCanvasWidth(): number {
    const svgCanvas: SVGElement = RendererSingleton.renderer.selectRootElement('#canvas', true);
    return parseFloat(svgCanvas.getAttribute('width') as string);
  }

  getCanvasHeight(): number {
    const svgCanvas: SVGElement = RendererSingleton.renderer.selectRootElement('#canvas', true);
    return parseFloat(svgCanvas.getAttribute('height') as string);
  }

  private handleError(error: HttpErrorResponse): Promise<never> {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
      return throwError(
        'A client side network error occurred').toPromise();
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
      return throwError(
        'The backend returned an unsuccessful response code').toPromise();
    }
  }
  localPostDrawing(name: string, tags: string[]): Promise<boolean> {
    const drawing = this.makeDrawing(name, tags);
    return this.saveFileToLocation(drawing)
      .then( () => {
        return true;
      })
      .catch((error: Error) => {
        console.error('An error occurred:', error.message);
        return throwError(`Le fichier n'a pas été sauvé correctement`).toPromise();
      });
  }

  saveFileToLocation(drawing: Drawing): Promise<boolean> {
    // solution inspired from https://stackoverflow.com/questions/48499087/file-save-functionality-in-angular
    const myBlob: Blob = new Blob([JSON.stringify(drawing, null, 2)], {type: 'application/json'});
    const link = RendererSingleton.renderer.createElement('a');
    link.href = URL.createObjectURL(myBlob);
    link.download = `${drawing.name}.json`;
    link.click();

    return Promise.resolve(true);
  }

  makeDrawing(name: string, tags: string[]): Drawing {
    const svgElements: string = this.getSvgElements();
    const miniature: string = this.getMiniature();
    const canvasWidth: number = this.getCanvasWidth();
    const canvasHeight: number = this.getCanvasHeight();
    const drawing: Drawing = {id: -1, name, svgElements, tags, miniature, canvasWidth, canvasHeight};
    return drawing;
  }
}
