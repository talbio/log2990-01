import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MatDialogModule, MatIconModule, MatSidenavModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {AppComponent} from './components/app/app.component';
import { WelcomeModalComponent } from './components/app/welcome-modal/welcome-modal.component';
import { ColorPaletteComponent } from './components/draw-view/color-palette/color-palette.component';
import { LateralBarComponent } from './components/draw-view/lateral-bar/lateral-bar.component';
import { WorkZoneComponent } from './components/draw-view/work-zone/work-zone.component';
import { StorageService } from './services/storage.service';

@NgModule({
  declarations: [
    AppComponent,
    WorkZoneComponent,
    LateralBarComponent,
    WelcomeModalComponent,
    ColorPaletteComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatSidenavModule,
    MatIconModule,
  ],
  entryComponents: [ColorPaletteComponent],
  providers: [StorageService],
  bootstrap: [AppComponent],
})
export class AppModule {
}
