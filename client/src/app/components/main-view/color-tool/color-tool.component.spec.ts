import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {of} from 'rxjs';
import { DemoMaterialModule } from 'src/app/material.module';
import {ColorService} from '../../../services/tools/color/color.service';
import {ColorToolComponent} from './color-tool.component';

/* -------------------------------- MOCK ENVIRONMENT ----------------------------------------- */
const fakeColorValue = 'fakeColorValue';
class MockMatDialog {
  open(component: Component, data: {data: any}) {
    return {
      afterClosed: () => of(fakeColorValue),
    };
  }
}

const spyColorService: jasmine.SpyObj<ColorService> =
  jasmine.createSpyObj('ColorService', [
    'getPrimaryColor',
    'addToTopTenColors',
    'primaryColor',
    'setPrimaryColor',
    'getSecondaryColor',
    'secondaryColor',
    'setSecondaryColor',
  ]);

/* ------------------------------------------------------------------------------------------ */

fdescribe('ColorToolComponent', () => {
  let component: ColorToolComponent;
  let fixture: ComponentFixture<ColorToolComponent>;

  const mockMatDialog = new MockMatDialog();

  beforeAll(async(() => {
    TestBed.configureTestingModule({
      declarations:
        [ColorToolComponent],
      imports:
        [DemoMaterialModule],
      providers: [
        { provide: ColorService, useValue: spyColorService },
        { provide: MatDialog, useValue: mockMatDialog },
      ],
    }).compileComponents().then( () => {
      fixture = TestBed.createComponent(ColorToolComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set primary color if user selected color', async () => {
    await component.openDialogForPrimaryColor();
    const colorService = fixture.componentRef.injector.get<ColorService>(ColorService);
    expect(colorService.primaryColor).toBe(fakeColorValue);
  });

  it('should set secondary color if user selected color', async () => {
    await component.openDialogForSecondaryColor();
    const colorService = fixture.componentRef.injector.get<ColorService>(ColorService);
    expect(colorService.secondaryColor).toBe(fakeColorValue);
  });
});
