import { BrushGeneratorService } from './services/tools/brush-generator/brush-generator.service';
import {PortalModule} from "@angular/cdk/portal";
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatDialogModule } from '@angular/material';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSliderModule} from '@angular/material/slider';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './components/app/app.component';
import { ConfirmGiveUpChangesDialogComponent } from './components/app/modals/confirm-give-up-changes-dialog/confirm-give-up-changes-dialog.component';
import { CreateDrawingDialogComponent } from './components/app/modals/create-drawing-dialog/create-drawing-dialog.component';
import { WelcomeModalComponent } from './components/app/welcome-modal/welcome-modal.component';
import {LateralBarComponent} from './components/draw-view/lateral-bar/lateral-bar.component';
import { ToolsAttributeComponent } from './components/draw-view/tools-attribute/tools-attribute.component';
import {WorkZoneComponent} from './components/draw-view/work-zone/work-zone.component';
import { StorageService } from './services/storage.service';
import { PencilGeneratorService } from './services/tools/pencil-generator/pencil-generator.service';
import { RectangleGeneratorService } from './services/tools/rectangle-generator/rectangle-generator.service';
import { ToolManagerService } from './services/tools/tool-manager/tool-manager.service';
import { ToolSelectorService } from './services/tools/tool-selector/tool-selector.service';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeModalComponent,
    CreateDrawingDialogComponent,
    WorkZoneComponent,
    LateralBarComponent,
    WelcomeModalComponent,
    ConfirmGiveUpChangesDialogComponent,
    ToolsAttributeComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatDialogModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatTooltipModule,
    MatToolbarModule,
    MatSliderModule,
    MatCardModule,
    PortalModule,
    MatSelectModule,
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'legacy' } },
    StorageService,
    RectangleGeneratorService,
    ToolManagerService,
    StorageService,
    PencilGeneratorService,
    ToolSelectorService,
    BrushGeneratorService,
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    CreateDrawingDialogComponent,
    ConfirmGiveUpChangesDialogComponent,
    ToolsAttributeComponent,
  ],
})
export class AppModule {
}
