import { Component } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-welcome-modal',
  templateUrl: './welcome-modal.component.html',
  styleUrls: ['./welcome-modal.component.scss'],
})

export class WelcomeModalComponent {
  protected readonly title: string = 'Bienvenue à PolyDessin!';
  protected readonly welcomeMessage: string = "Vous trouverez le guide d'utilisation dans la barre de menu à gauche";
  protected readonly doNotShowAgain: string = 'Ne plus afficher ce message';
  protected readonly close: string = 'fermer';
  show: boolean;

  constructor(private storage: StorageService) {
    this.show = !this.storage.getWelcomeModalStatus();
  }

  onChange(event: Event): void {
    this.storage.setWelcomeModalStatus(event.returnValue);
  }

}
