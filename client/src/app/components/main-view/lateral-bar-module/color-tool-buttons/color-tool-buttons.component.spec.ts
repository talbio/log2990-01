import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {of} from 'rxjs';
import { DemoMaterialModule } from 'src/app/material.module';
import {ColorService} from '../../../../services/tools/color/color.service';
import {ColorToolButtonsComponent} from './color-tool-buttons.component';

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

describe('ColorToolButtonsComponent', () => {
  let component: ColorToolButtonsComponent;
  let fixture: ComponentFixture<ColorToolButtonsComponent>;

  const mockMatDialog = new MockMatDialog();

  beforeAll(async(() => {
    TestBed.configureTestingModule({
      declarations:
        [ColorToolButtonsComponent],
      imports:
        [DemoMaterialModule],
      providers: [
        { provide: ColorService, useValue: spyColorService },
        { provide: MatDialog, useValue: mockMatDialog },
      ],
    }).compileComponents().then( () => {
      fixture = TestBed.createComponent(ColorToolButtonsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
