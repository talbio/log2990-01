import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatDialogModule } from '@angular/material';
import {MatButtonModule} from '@angular/material/button';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSidenavModule} from '@angular/material/sidenav';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './components/app/app.component';
import { CreateDrawingDialogComponent } from './components/app/modals/create-drawing-dialog/create-drawing-dialog.component';
import { WelcomeModalComponent } from './components/app/welcome-modal/welcome-modal.component';
import {LateralBarComponent} from './components/draw-view/lateral-bar/lateral-bar.component';
import {WorkZoneComponent} from './components/draw-view/work-zone/work-zone.component';
import { StorageService } from './services/storage.service';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeModalComponent,
    CreateDrawingDialogComponent,
    WorkZoneComponent,
    LateralBarComponent,
    WelcomeModalComponent,
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
  ],
  providers: [
    StorageService,
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'legacy' } },
  ],
  bootstrap: [AppComponent],
  entryComponents: [CreateDrawingDialogComponent],
})
export class AppModule {
}
