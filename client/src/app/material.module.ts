import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {MatDialogModule } from '@angular/material';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSliderModule} from '@angular/material/slider';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  exports: [
    CommonModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatTooltipModule,
    MatToolbarModule,
    MatSliderModule,
    MatCardModule,
    MatSelectModule,
    MatIconModule,
    MatFormFieldModule,
  ],
})
export class DemoMaterialModule { }
