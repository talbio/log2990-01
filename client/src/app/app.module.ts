import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import {AppComponent} from './components/app/app.component';
import { WelcomeModalComponent } from './components/app/welcome-modal/welcome-modal.component';
import { StorageService } from './services/storage.service';

const routes: Routes = [
   { path: 'welcome-modal', component: WelcomeModalComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    WelcomeModalComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
  ],
  providers: [StorageService],
  bootstrap: [AppComponent],
})
export class AppModule {
}
