import { Component } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-welcome-modal',
  templateUrl: './welcome-modal.component.html',
  styleUrls: ['./welcome-modal.component.scss'],
})

export class WelcomeModalComponent {
  show: boolean;

  constructor( private storage: StorageService) {
    this.show = !this.storage.getWelcomeModalStatus();
  }

  onChange(event: Event): void {
    this.storage.setWelcomeModalStatus(event.returnValue);
  }

}
