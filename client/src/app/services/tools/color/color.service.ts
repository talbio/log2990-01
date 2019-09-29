import { Injectable, Input } from '@angular/core';
import { StorageService } from '../../storage/storage.service';

enum Colors {

    BLUE = 'rgba(0, 0, 250, 1)',
    RED = 'rgba(250, 0, 0, 1)',
    GREEN = 'rgba(0, 250, 0, 1)',
    YELLOW = 'rgba(246, 227, 60, 1)',
    PINK = 'rgba(246, 60, 193, 1)',
    BLACK = 'rgba(0, 0, 0, 1)',
    GREY = 'rgba(138, 138, 138, 1)',
    BROWN = 'rgba(135, 75, 23, 1)',
    ORANGE = 'rgba(254, 140, 52, 1)',
    PURPLE = 'rgba(166, 52, 254, 1)'

}

@Injectable({
    providedIn: 'root',
})

export class ColorService {

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

    setPrimaryColor(color:string):void{
        this.storage.setPrimaryColor(color);
    }

    setSecondaryColor(color:string):void{
        this.storage.setSecondaryColor(color);
    }


    assignTopTenColors(): void {
        if (!this.topTenColors) {
            this.topTenColors = [Colors.BLUE, Colors.RED, Colors.GREEN, Colors.YELLOW, Colors.PINK, Colors.BLACK, Colors.GREY, Colors.BROWN, Colors.ORANGE, Colors.PURPLE];
        }

    }


    assignPrimaryColor(): void {
        const color = this.storage.getPrimaryColor();
        if (color !== 'empty') {
            this.primaryColor = this.storage.getPrimaryColor();
        }
        this.storage.setPrimaryColor('#000000');
        this.primaryColor = '#000000';
    }

    assignSecondaryColor(): void {
        const color = this.storage.getSecondaryColor();
        if (color !== 'empty') {
            this.secondaryColor = this.storage.getSecondaryColor();
        }
        this.storage.setSecondaryColor('#FFFFFF');
        this.secondaryColor = '#FFFFFF';
    }

    addToTopTenColors(color:string):void{
        if (color !== undefined){
              for ( let i :number = 0; i< this.topTenColors.length; i++){
              this.topTenColors[i] = this.topTenColors[i+1];
              }
              this.topTenColors.splice(-1,1);
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

    modifyPrimaryColorTransparency(transparency: number) {
        this.primaryTransparency = transparency;
    }
    
}

