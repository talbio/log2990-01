import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
  })

export class StorageService {

    setWelcomeModalStatus(status: boolean): void {
        sessionStorage.setItem('welcomeModal', status.toString());
    }

    getWelcomeModalStatus(): boolean {
        return (sessionStorage.getItem('welcomeModal') === 'true');
    }

    setPrimaryColor(color: string): void {
        sessionStorage.setItem('primaryColor', color);
    }

    getPrimaryColor(): string {
            return (sessionStorage.getItem('primaryColor') || '{}');
    }

    setSecondaryColor(color: string): void {
        sessionStorage.setItem('secondaryColor', color);
    }

    getSecondaryColor(): string {
            return (sessionStorage.getItem('secondaryColor') || '{}');
    }

}
