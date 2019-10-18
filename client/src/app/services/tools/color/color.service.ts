
import { Injectable, Input } from '@angular/core';
import { Colors } from 'src/app/data-structures/Colors';
import { StorageService } from '../../storage/storage.service';

@Injectable({
    providedIn: 'root',
})

export class ColorService {

    protected readonly empty: string = 'empty';

    @Input()
    color: string;
    primaryColor: string;
    secondaryColor: string;
    topTenColors: string[];
    primaryTransparency: number;
    secondaryTransparency: number;

    constructor(private storage: StorageService) {
        this.assignTopTenColors();
        this.assignPrimaryColor();
        this.assignSecondaryColor();
    }

    getPrimaryColor(): string {
        return this.storage.getPrimaryColor();
    }

    getSecondaryColor(): string {
        return this.storage.getSecondaryColor();
    }

    setPrimaryColor(color: string): void {
        this.storage.setPrimaryColor(color);
    }

    setSecondaryColor(color: string): void {
        this.storage.setSecondaryColor(color);
    }

    assignTopTenColors(): void {
        if (!this.topTenColors) {
            this.topTenColors = [Colors.BLUE, Colors.RED, Colors.GREEN, Colors.YELLOW,
                Colors.PINK, Colors.BLACK, Colors.GREY, Colors.BROWN, Colors.ORANGE, Colors.PURPLE];
        }

    }

    assignPrimaryColor(): void {
        const color = this.storage.getPrimaryColor();
        if (color !== this.empty) {
            this.primaryColor = this.storage.getPrimaryColor();
        } else {
            this.storage.setPrimaryColor(Colors.WHITE);
            this.primaryColor = Colors.WHITE;
        }
    }

    assignSecondaryColor(): void {
        const color = this.storage.getSecondaryColor();
        if (color !== this.empty) {
            this.secondaryColor = this.storage.getSecondaryColor();
        } else {
            this.storage.setSecondaryColor(Colors.BLACK);
            this.secondaryColor = Colors.BLACK;
        }
    }

    addToTopTenColors(color: string): void {
        if (color !== undefined) {
              for ( let i = 0; i < this.topTenColors.length; i++) {
              this.topTenColors[i] = this.topTenColors[i + 1];
              }
              this.topTenColors.splice(-1, 1);
              this.topTenColors.push(color);
        }
    }

    switchMainColors(): void {
        const temp = this.primaryColor;
        this.primaryColor = this.secondaryColor;
        this.secondaryColor = temp;
        this.storage.setPrimaryColor(this.primaryColor);
        this.storage.setSecondaryColor(this.secondaryColor);
    }

}
