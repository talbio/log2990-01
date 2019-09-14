import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import { MatDialogModule } from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import {AppComponent} from './components/app/app.component';
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
  ],
  imports: [
    BrowserModule,
    MatDialogModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
  ],
  providers: [StorageService],
  bootstrap: [AppComponent],
})
export class AppModule {
}
