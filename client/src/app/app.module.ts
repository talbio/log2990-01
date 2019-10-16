import {PortalModule} from '@angular/cdk/portal';
import {HttpClientModule} from '@angular/common/http';
import {NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NotifierModule, NotifierOptions, NotifierService} from 'angular-notifier';
import { DrawingViewComponent } from './components/main-view/drawing-view/drawing-view.component';
// tslint:disable-next-line:max-line-length
import { AbstractDialogButtonComponent } from './components/main-view/lateral-bar-module/abstract-dialog-button/abstract-dialog-button.component';
import { AbstractToolButtonComponent } from './components/main-view/lateral-bar-module/abstract-tool-button/abstract-tool-button.component';
import { ColorToolButtonsComponent } from './components/main-view/lateral-bar-module/color-tool-buttons/color-tool-buttons.component';
import { LateralBarComponent } from './components/main-view/lateral-bar-module/lateral-bar/lateral-bar.component';
// tslint:disable-next-line:max-line-length
import { ToolsAttributesBarComponent } from './components/main-view/tools-attributes-module/tools-attributes-bar/tools-attributes-bar.component';
import { BrushToolsComponent } from './components/main-view/tools-attributes-module/tools-attributes/brush/brush-tools.component';
// tslint:disable-next-line:max-line-length
import { ColorApplicatorToolsComponent } from './components/main-view/tools-attributes-module/tools-attributes/color-applicator/color-applicator-tools.component';
import { EllipseToolsComponent } from './components/main-view/tools-attributes-module/tools-attributes/ellipse/ellipse-tools.component';
import { LineToolsComponent } from './components/main-view/tools-attributes-module/tools-attributes/line/line-tools.component';
import { PencilToolsComponent } from './components/main-view/tools-attributes-module/tools-attributes/pencil/pencil-tools.component';
// tslint:disable-next-line:max-line-length
import { RectangleToolsComponent } from './components/main-view/tools-attributes-module/tools-attributes/rectangle/rectangle-tools.component';
import { WorkZoneComponent } from './components/main-view/work-zone/work-zone.component';
import { ColorPaletteComponent } from './components/modals/color-picker-module/color-palette/color-palette.component';
import { ColorPickerDialogComponent } from './components/modals/color-picker-module/color-picker-dialog/color-picker-dialog.component';
import { ColorSliderComponent } from './components/modals/color-picker-module/color-slider/color-slider.component';
import { LastTenColorsComponent } from './components/modals/color-picker-module/last-ten-colors/last-ten-colors.component';
import { CreateDrawingDialogComponent } from './components/modals/create-drawing-dialog/create-drawing-dialog.component';
import { GiveUpChangesDialogComponent } from './components/modals/give-up-changes-dialog/give-up-changes-dialog.component';
import { OpenListDrawingsServerComponent } from './components/modals/open-list-drawings-server/open-list-drawings-server.component';
import { SaveDrawingDialogComponent } from './components/modals/save-drawing-dialog/save-drawing-dialog.component';
import { WelcomeModalComponent } from './components/modals/welcome-modal/welcome-modal.component';
import {DemoMaterialModule} from './material.module';
import {SaveDrawingService} from './services/back-end/save-drawing/save-drawing.service';
import { MousePositionService } from './services/mouse-position/mouse-position.service';
import { StorageService } from './services/storage/storage.service';
import { BrushGeneratorService } from './services/tools/brush-generator/brush-generator.service';
import { ColorApplicatorService } from './services/tools/color-applicator/color-applicator.service';
import { ColorService } from './services/tools/color/color.service';
import { EllipseGeneratorService } from './services/tools/ellipse-generator/ellipse-generator.service';
import { LineGeneratorService } from './services/tools/line-generator/line-generator.service';
import { PencilGeneratorService } from './services/tools/pencil-generator/pencil-generator.service';
import { RectangleGeneratorService } from './services/tools/rectangle-generator/rectangle-generator.service';
import { ToolManagerService } from './services/tools/tool-manager/tool-manager.service';

const customNotifierOptions: NotifierOptions = {
  position: {
    horizontal: {
      position: 'right',
      distance: 12,
    },
    vertical: {
      position: 'bottom',
      distance: 12,
      gap: 10,
    },
  },
  theme: 'material',
  behaviour: {
    autoHide: 5000,
    onClick: 'hide',
    onMouseover: 'pauseAutoHide',
    showDismissButton: true,
    stacking: 4,
  },
  animations: {
    enabled: true,
    show: {
      preset: 'slide',
      speed: 300,
      easing: 'ease',
    },
    hide: {
      preset: 'fade',
      speed: 300,
      easing: 'ease',
      offset: 50,
    },
    shift: {
      speed: 300,
      easing: 'ease',
    },
    overlap: 150,
  },
};

@NgModule({
  declarations: [
    WelcomeModalComponent,
    CreateDrawingDialogComponent,
    WorkZoneComponent,
    DrawingViewComponent,
    WelcomeModalComponent,
    ColorToolButtonsComponent,
    ColorPaletteComponent,
    ColorSliderComponent,
    GiveUpChangesDialogComponent,
    ToolsAttributesBarComponent,
    LateralBarComponent,
    ColorPickerDialogComponent,
    LastTenColorsComponent,
    SaveDrawingDialogComponent,
    AbstractToolButtonComponent,
    AbstractDialogButtonComponent,
    PencilToolsComponent,
    RectangleToolsComponent,
    LineToolsComponent,
    EllipseToolsComponent,
    BrushToolsComponent,
    ColorApplicatorToolsComponent,
    OpenListDrawingsServerComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    PortalModule,
    DemoMaterialModule,
    NotifierModule.withConfig(customNotifierOptions),
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'legacy' } },
    StorageService,
    RectangleGeneratorService,
    EllipseGeneratorService,
    ToolManagerService,
    StorageService,
    PencilGeneratorService,
    BrushGeneratorService,
    ColorApplicatorService,
    ColorService,
    SaveDrawingService,
    NotifierService,
    LineGeneratorService,
    MousePositionService,
  ],
  bootstrap: [DrawingViewComponent],
  entryComponents: [
    ColorToolButtonsComponent,
    CreateDrawingDialogComponent,
    GiveUpChangesDialogComponent,
    ToolsAttributesBarComponent,
    ColorPickerDialogComponent,
    SaveDrawingDialogComponent,
    PencilToolsComponent,
    RectangleToolsComponent,
    LineToolsComponent,
    EllipseToolsComponent,
    BrushToolsComponent,
    ColorApplicatorToolsComponent,
    OpenListDrawingsServerComponent,
  ],
})
export class AppModule {
}
