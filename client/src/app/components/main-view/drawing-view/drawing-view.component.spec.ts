import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {PortalModule} from '@angular/cdk/portal';
import {HttpClientModule} from '@angular/common/http';
import { Component } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { DemoMaterialModule } from 'src/app/material.module';
import { ToolSelectorService } from 'src/app/services/tools/tool-selector/tool-selector.service';
import { DrawingViewComponent } from './drawing-view.component';

@Component({selector: 'app-lateral-bar', template: ''})
class LateralBarStubComponent {}

// tslint:disable-next-line:max-classes-per-file
@Component({selector: 'app-welcome-modal', template: ''})
class WelcomeModalStubComponent {}

// tslint:disable-next-line:max-classes-per-file
@Component({selector: '<app-work-zone', template: ''})
class WorkZoneStubComponent {}

describe('DrawingViewComponent', () => {
  let component: DrawingViewComponent;
  let fixture: ComponentFixture<DrawingViewComponent>;
  // tslint:disable-next-line:prefer-const
  let toolSelectorServiceStub: Partial<ToolSelectorService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations:
      [ DrawingViewComponent,
        WelcomeModalStubComponent,
        WorkZoneStubComponent,
        LateralBarStubComponent,
        // ToolsAttributesComponent,
      ],
      imports:
      [
      DemoMaterialModule,
      PortalModule,
      BrowserAnimationsModule,
      HttpClientModule,
    ],
      providers:    [ {provide: ToolSelectorService, useValue: toolSelectorServiceStub } ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawingViewComponent);
    component = fixture.componentInstance;
    // UserService actually injected into the component
    toolSelectorServiceStub = fixture.debugElement.injector.get(ToolSelectorService);
    // UserService from the root injector
    toolSelectorServiceStub = TestBed.get(ToolSelectorService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
