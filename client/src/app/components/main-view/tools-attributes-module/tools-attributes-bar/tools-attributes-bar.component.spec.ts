import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DemoMaterialModule } from 'src/app/material.module';
import { BrushGeneratorService } from 'src/app/services/tools/brush-generator/brush-generator.service';
import { PencilGeneratorService } from 'src/app/services/tools/pencil-generator/pencil-generator.service';
import { RectangleGeneratorService } from 'src/app/services/tools/rectangle-generator/rectangle-generator.service';
import { ToolsAttributesComponent } from './tools-attributes.component';

describe('ToolsAttributeComponent', () => {
  let component: ToolsAttributesComponent;
  let fixture: ComponentFixture<ToolsAttributesComponent>;
  // tslint:disable-next-line:prefer-const
  let pencilGeneratorServiceStub: Partial<PencilGeneratorService>;
  // tslint:disable-next-line:prefer-const
  let rectangleGeneratorServiceStub: Partial<RectangleGeneratorService>;
  // tslint:disable-next-line:prefer-const
  let brushGeneratorServiceStub: Partial<BrushGeneratorService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolsAttributesComponent ],
      imports: [DemoMaterialModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule,  ],
      providers:    [
        {provide: PencilGeneratorService, useValue: pencilGeneratorServiceStub },
        {provide: RectangleGeneratorService, useValue: rectangleGeneratorServiceStub },
        {provide: BrushGeneratorService, useValue: brushGeneratorServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolsAttributesComponent);
    component = fixture.componentInstance;
     // UserService actually injected into the component
    pencilGeneratorServiceStub = fixture.debugElement.injector.get(PencilGeneratorService);
    rectangleGeneratorServiceStub = fixture.debugElement.injector.get(RectangleGeneratorService);
    brushGeneratorServiceStub = fixture.debugElement.injector.get(BrushGeneratorService);
     // UserService from the root injector
    pencilGeneratorServiceStub = TestBed.get(PencilGeneratorService);
    rectangleGeneratorServiceStub = TestBed.get(rectangleGeneratorServiceStub);
    brushGeneratorServiceStub = TestBed.get(brushGeneratorServiceStub);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
