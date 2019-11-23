import { Component } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ModalManagerSingleton } from './../modal-manager-singleton';

@Component({
  selector: 'app-welcome-modal',
  templateUrl: './welcome-modal.component.html',
  styleUrls: ['./welcome-modal.component.scss'],
})

export class WelcomeModalComponent {
  protected readonly title: string = 'Bienvenue à PolyDessin!';
  protected readonly welcomeMessage: string = 'Vous trouverez le guide d\'utilisation dans la barre de menu à gauche';
  protected readonly doNotShowAgain: string = 'Ne plus afficher ce message';
  protected readonly close: string = 'fermer';
  show: boolean;
  private modalManager = ModalManagerSingleton.getInstance();

  constructor(private storage: StorageService) {
    this.show = !this.storage.getWelcomeModalStatus();
    this.modalManager._isModalActive = true;
  }

  onChange(): void {
    this.storage.setWelcomeModalStatus(!this.storage.getWelcomeModalStatus());
  }

  closeDialog(): void {
    this.show = false;
    this.modalManager._isModalActive = false;
  }

}
