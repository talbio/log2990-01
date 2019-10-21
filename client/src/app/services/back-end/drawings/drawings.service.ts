import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Injectable, Renderer2} from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Drawing} from '../../../../../../common/communication/Drawing';

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

  private svgCanvas: any;
  private renderer: Renderer2;

  constructor(private httpClient: HttpClient) {}

  set _renderer(renderer: Renderer2) {
    this.renderer = renderer;
    this.svgCanvas = this.renderer.selectRootElement('#canvas', true);
  }

  httpPostDrawing(name: string, tags: string[]): Promise<boolean> {
    const svgElements: string = this.getSvgElements();
    const miniature: string = this.getMiniature();
    const drawing: Drawing = {name, svgElements, tags, miniature};
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

  private handleErrorGet<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
    console.error(error);
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
    // const miniature = this.renderer.selectRootElement('#min', true);
    const clonedDrawing = this.svgCanvas.cloneNode(true);
    this.renderer.removeAttribute(clonedDrawing, 'id');
    console.log(new XMLSerializer().serializeToString(clonedDrawing));
    return (new XMLSerializer()).serializeToString(clonedDrawing);
    // return clonedDrawing.innerHTML;
    // return miniature.outerHTML as string;
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

}
