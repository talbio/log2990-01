import {PortalModule} from '@angular/cdk/portal';
import {HttpClientModule} from '@angular/common/http';
import {NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { ColorToolComponent } from './components/main-view/color-tool/color-tool.component';
import { DrawingViewComponent } from './components/main-view/drawing-view/drawing-view.component';
import { LateralBarComponent } from './components/main-view/lateral-bar/lateral-bar.component';
import { ToolsAttributesComponent } from './components/main-view/tools-attributes/tools-attributes.component';
import { WorkZoneComponent } from './components/main-view/work-zone/work-zone.component';
import { ColorPaletteComponent } from './components/modals/color-picker-module/color-palette/color-palette.component';
import { ColorPickerDialogComponent } from './components/modals/color-picker-module/color-picker-dialog/color-picker-dialog.component';
import { ColorSliderComponent } from './components/modals/color-picker-module/color-slider/color-slider.component';
import { LastTenColorsComponent } from './components/modals/color-picker-module/last-ten-colors/last-ten-colors.component';
import { CreateDrawingDialogComponent } from './components/modals/create-drawing-dialog/create-drawing-dialog.component';
import { GiveUpChangesDialogComponent } from './components/modals/give-up-changes-dialog/give-up-changes-dialog.component';
import { WelcomeModalComponent } from './components/modals/welcome-modal/welcome-modal.component';
import {DemoMaterialModule} from './material.module';
import { StorageService } from './services/storage/storage.service';
import { BrushGeneratorService } from './services/tools/brush-generator/brush-generator.service';
import { ColorApplicatorService } from './services/tools/color-applicator/color-applicator.service';
import { ColorService } from './services/tools/color/color.service';
import { PencilGeneratorService } from './services/tools/pencil-generator/pencil-generator.service';
import { RectangleGeneratorService } from './services/tools/rectangle-generator/rectangle-generator.service';
import { ToolManagerService } from './services/tools/tool-manager/tool-manager.service';

@NgModule({
  declarations: [
    WelcomeModalComponent,
    CreateDrawingDialogComponent,
    WorkZoneComponent,
    DrawingViewComponent,
    WelcomeModalComponent,
    ColorToolComponent,
    ColorPaletteComponent,
    ColorSliderComponent,
    GiveUpChangesDialogComponent,
    ToolsAttributesComponent,
    LateralBarComponent,
    ColorPickerDialogComponent,
    LastTenColorsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    PortalModule,
    DemoMaterialModule,

  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'legacy' } },
    StorageService,
    RectangleGeneratorService,
    ToolManagerService,
    StorageService,
    PencilGeneratorService,
    BrushGeneratorService,
    ColorApplicatorService,
    ColorService,
  ],
  bootstrap: [DrawingViewComponent],
  entryComponents: [
    ColorToolComponent,
    CreateDrawingDialogComponent,
    GiveUpChangesDialogComponent,
    ToolsAttributesComponent,
    ColorPickerDialogComponent,
  ],
})
export class AppModule {
}
