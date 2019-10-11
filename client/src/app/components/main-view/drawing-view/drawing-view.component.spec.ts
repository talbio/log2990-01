// import {ComponentPortal, PortalModule} from '@angular/cdk/portal';
import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {ChangeDetectorRef, Component, NO_ERRORS_SCHEMA} from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';
import {DemoMaterialModule} from '../../../material.module';
// import {MatSidenavModule} from '@angular/material/sidenav';
// import {ToolsAttributesComponent} from '../tools-attributes/tools-attributes.component';
import { DrawingViewComponent } from './drawing-view.component';
// import {NgTemplateOutlet} from "@angular/common";

/* tslint:disable:max-classes-per-file for mocking classes*/

@Component({selector: 'app-lateral-bar', template: ''})
class LateralBarStubComponent {}

@Component({selector: 'app-welcome-modal', template: ''})
class WelcomeModalStubComponent {}

@Component({selector: '<app-work-zone', template: ''})
class WorkZoneStubComponent {}

@Component({selector: '<app-tools-attributes', template: ''})
class ToolsAttributesStubComponent {}

@Component({selector: '<app-tools-attributes-one', template: ''})
class ToolsAttributesComponent {}

fdescribe('DrawingViewComponent', () => {
  let component: DrawingViewComponent;
  let fixture: ComponentFixture<DrawingViewComponent>;
  // let toolSelectorServiceStub: Partial<ToolSelectorService>;
  // const cp = new ComponentPortal <ToolsAttributesComponent>(ToolsAttributesComponent);

  beforeAll(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DrawingViewComponent,
        WelcomeModalStubComponent,
        LateralBarStubComponent,
        ToolsAttributesStubComponent,
        WorkZoneStubComponent,
        ToolsAttributesComponent,
      ],
      imports: [
        DemoMaterialModule,
        CommonModule,
        PortalModule,
      ],
      providers: [ChangeDetectorRef],
      schemas: [ NO_ERRORS_SCHEMA ],
    }).overrideModule(BrowserDynamicTestingModule, { set: {entryComponents: [ToolsAttributesComponent]} },
    ).compileComponents().then( () => {
      fixture = TestBed.createComponent(DrawingViewComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
