import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Renderer2} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {ToolManagerService} from '../../tools/tool-manager/tool-manager.service';
import { SaveDrawingService } from './save-drawing.service';

const httpClientSpy: jasmine.SpyObj<HttpClient> =
  jasmine.createSpyObj('HttpClient', ['post', 'get']);

const rendererSpy: jasmine.SpyObj<Renderer2> =
  jasmine.createSpyObj('Renderer2', ['selectRootElement']);

const svgCanvasSpy: jasmine.SpyObj<Element> =
  jasmine.createSpyObj('Element', ['innerHTML', 'outerHTML']);

const ToolManagerSpy: jasmine.SpyObj<ToolManagerService> =
  jasmine.createSpyObj('ToolManagerService', ['deleteAllDrawings']);
ToolManagerSpy.deleteAllDrawings.and.callThrough();

const FAKE_SVG_CANVAS = `<defs></defs><rect></rect>`;
const FAKE_SVG_CANVAS_INNER_HTML = `<rect></rect>`;

const FAKE_SVG_MINIATURE = `<svg><path></path></svg>`;

let saveDrawingService: SaveDrawingService;

describe('SaveDrawingService', () => {
  beforeEach(async () => TestBed.configureTestingModule({
    providers: [
      {provide: HttpClient, useValue: httpClientSpy},
      {provide: ToolManagerService, useValue: ToolManagerSpy},
      {provide: Renderer2, useValue: rendererSpy},
    ],
  }).compileComponents().then( () => {
    saveDrawingService = TestBed.get(SaveDrawingService);
    rendererSpy.selectRootElement.and.returnValue(svgCanvasSpy);
    svgCanvasSpy.innerHTML = FAKE_SVG_CANVAS;
    saveDrawingService._renderer = rendererSpy;
  }));

  it('should be created', () => {
    expect(saveDrawingService).toBeTruthy();
  });

  it('httpPostDrawing should return true if request was successful', async () => {
    httpClientSpy.post.and.returnValue(of({httpCode: 200}));
    await saveDrawingService.httpPostDrawing('fake', [])
      .then((success: boolean) => expect(success).toBe(true));
  });

  it('httpPostDrawing should return false if server responded with bad request code', async () => {
    httpClientSpy.post.and.returnValue(of({httpCode: 400}));
    await saveDrawingService.httpPostDrawing('fake', [])
      .then((success: boolean) => expect(success).toBe(false));
  });

  it('httpPostDrawing should return error if an http error occurred', async () => {
    const fakeError = {error: 'fake error'};
    httpClientSpy.post.and.returnValue(throwError(new HttpErrorResponse(fakeError)));
    await saveDrawingService.httpPostDrawing('fake', []).then(
      async (success: boolean) => fail(),
      async (error) => await expect(error.error).not.toBe(null),
    );
  });

  it('getSvgElements should retrieve svg elements from canvas', () => {
    expect(saveDrawingService.getSvgElements()).toBe(FAKE_SVG_CANVAS_INNER_HTML);
  });

  it('getMiniature should return svg miniature', () => {
    svgCanvasSpy.outerHTML = FAKE_SVG_MINIATURE;
    expect(saveDrawingService.getMiniature()).toBe(FAKE_SVG_MINIATURE);
  });

});
