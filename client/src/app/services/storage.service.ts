import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
  })

export class StorageService {

    setWelcomeModalStatus(status: any): void {
        sessionStorage.setItem('welcomeModal', status.toString());
    }

    getWelcomeModalStatus(): boolean {
        return (sessionStorage.getItem('welcomeModal') === 'true');
    }
}
