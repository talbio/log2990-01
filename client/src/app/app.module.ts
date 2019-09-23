import { ButtonManagerService } from './services/buttonManager.service';
import { PenModeService } from './components/app/pen-mode.service';
import { ModeManagerService } from './services/mode-manager.service';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {BrowserModule} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {AppComponent} from './components/app/app.component';
import { WelcomeModalComponent } from './components/app/welcome-modal/welcome-modal.component';
import { LateralBarComponent } from './components/draw-view/lateral-bar/lateral-bar.component';
import { WorkZoneComponent } from './components/draw-view/work-zone/work-zone.component';
import { ShapeGeneratorService } from './components/shapeGenerator.service';
import { StorageService } from './services/storage.service';

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
  providers: [ShapeGeneratorService,
              ModeManagerService,
              StorageService,
              PenModeService,
              ButtonManagerService],
  bootstrap: [AppComponent],
})
export class AppModule {
}
