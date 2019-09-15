import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatDialogModule } from '@angular/material';
import {MatButtonModule} from '@angular/material/button';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './components/app/app.component';
import { CreateDrawingDialogComponent } from './components/app/modals/create-drawing-dialog/create-drawing-dialog.component';
import { NewDrawingModalComponent } from './components/app/new-drawing-modal/new-drawing-modal.component';
import { WelcomeModalComponent } from './components/app/welcome-modal/welcome-modal.component';
import { StorageService } from './services/storage.service';

const routes: Routes = [
   { path: 'welcome-modal', component: WelcomeModalComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    WelcomeModalComponent,
    NewDrawingModalComponent,
    CreateDrawingDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatDialogModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
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
