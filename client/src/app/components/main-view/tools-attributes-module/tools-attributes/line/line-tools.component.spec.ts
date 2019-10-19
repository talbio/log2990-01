import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DemoMaterialModule } from 'src/app/material.module';
// import { LineDashStyle, LineJoinStyle } from './../../../../../data-structures/LineStyles';
import { LineGeneratorService } from './../../../../../services/tools/line-generator/line-generator.service';
import { LineToolsComponent } from './line-tools.component';
// import { MatSliderChange } from '@angular/material';
// import { DebugElement } from '@angular/core';

fdescribe('LineToolsComponent', () => {
  let component: LineToolsComponent;
  let fixture: ComponentFixture<LineToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineToolsComponent ],
      imports: [DemoMaterialModule],
      providers: [LineGeneratorService, ],
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(LineToolsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should change the value of lineGeneratorTools _strokeWidth when slider value changes', (() => {
  //   // Select the slider
  //   const strokeSlider = fixture.debugElement.nativeElement.querySelector('[name=stroke-width-slider]');
  //   // set new value to 10
  //   // strokeSlider.value = '10';
  //   const changeEvent = new KeyboardEvent('input');
  //   strokeSlider.dispatchEvent(changeEvent);
  //   fixture.detectChanges();
  //   expect(strokeSlider.value).toEqual('10');
  //   // minimum is 1, so negative values should be rejected
  //   // strokeSlider.value = '-1';
  //   changeEvent.value = -1;
  //   strokeSlider.dispatchEvent(changeEvent);
  //   expect(strokeSlider.value).not.toEqual('-1');
  // }));
});
