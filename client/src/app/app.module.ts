import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {BrowserModule} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {AppComponent} from './components/app/app.component';
import { WelcomeModalComponent } from './components/app/welcome-modal/welcome-modal.component';
import { LateralBarComponent } from './components/draw-view/lateral-bar/lateral-bar.component';
import { WorkZoneComponent } from './components/draw-view/work-zone/work-zone.component';
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
    MatIconModule,
    MatButtonModule,
    MatListModule,
  ],
  providers: [StorageService],
  bootstrap: [AppComponent],
})
export class AppModule {
}
