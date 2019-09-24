import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {BrowserModule} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {AppComponent} from './components/app/app.component';
import { WelcomeModalComponent } from './components/app/welcome-modal/welcome-modal.component';
import { LateralBarComponent } from './components/draw-view/lateral-bar/lateral-bar.component';
import { WorkZoneComponent } from './components/draw-view/work-zone/work-zone.component';
import { StorageService } from './services/storage.service';
import { PencilGeneratorService } from './services/tools/pencil-generator/pencil-generator.service';
import { RectangleGeneratorService } from './services/tools/rectangle-generator/rectangle-generator.service';
import { ToolManagerService } from './services/tools/tool-manager/tool-manager.service';
import { ToolSelectorService } from './services/tools/tool-selector/tool-selector.service';

@NgModule({
  declarations: [
    AppComponent,
    WorkZoneComponent,
    LateralBarComponent,
    WelcomeModalComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSidenavModule,
  ],
  providers: [RectangleGeneratorService,
              ToolManagerService,
              StorageService,
              PencilGeneratorService,
              ToolSelectorService],
  bootstrap: [AppComponent],
})
export class AppModule {
}
