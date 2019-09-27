import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  onShiftDown(keyboardEvent: KeyboardEvent){
    console.log("YEAH");
  }
}
