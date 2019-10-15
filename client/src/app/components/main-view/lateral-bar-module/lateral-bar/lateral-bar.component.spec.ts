import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {HttpClientModule} from '@angular/common/http';
import { Component } from '@angular/core';
import { DemoMaterialModule } from 'src/app/material.module';
import { ToolManagerService } from 'src/app/services/tools/tool-manager/tool-manager.service';
import { LateralBarComponent } from './lateral-bar.component';

@Component({selector: 'app-color-tool', template: ''})
class ColorToolStubComponent {}

describe('LateralBarComponent', () => {
  let component: LateralBarComponent;
  let fixture: ComponentFixture<LateralBarComponent>;
  // tslint:disable-next-line:prefer-const
  // tslint:disable-next-line:prefer-const
  let toolManagerServiceStub: Partial<ToolManagerService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LateralBarComponent, ColorToolStubComponent ],
      imports: [DemoMaterialModule, HttpClientModule,  ],
      providers:    [
        {provide: ToolManagerService, useValue: toolManagerServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LateralBarComponent);
    component = fixture.componentInstance;
    toolManagerServiceStub = fixture.debugElement.injector.get(ToolManagerService);
    toolManagerServiceStub = TestBed.get(ToolManagerService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
