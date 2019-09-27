import { Injectable, Input } from '@angular/core';
import { StorageService } from '../../storage/storage.service';
import { MatDialog } from '@angular/material';
import { ToolManagerService } from '../tool-manager/tool-manager.service';
import { ColorPickerDialogComponent } from 'src/app/components/modals/color-picker-dialog/color-picker-dialog.component';

@Injectable({
    providedIn: 'root',
})

export class ColorService {

    @Input()
    color: string;

    constructor(private storage: StorageService, public dialog: MatDialog, private toolManager: ToolManagerService) {
    }

    primaryColor: string;
    secondaryColor: string;
    primaryTransparency: number;
    secondaryTransparency: number;

    getPrimaryColor(): string {
        return this.primaryColor;
    }

    getSecondaryColor(): string {
        return this.secondaryColor;
    }

    openDialog(colorToModify: string): void {
        const dialogRef = this.dialog.open(ColorPickerDialogComponent, {
            height: '300px',
            width: '500px',
        });
        dialogRef.afterClosed().subscribe((selectedColor) => {
            if (colorToModify === 'primary') {
                this.primaryColor = selectedColor;
                this.storage.setPrimaryColor(selectedColor);
                this.toolManager.primaryColor = selectedColor;
            }
            if (colorToModify === 'secondary') {
                this.secondaryColor = selectedColor;
                this.storage.setSecondaryColor(selectedColor);
                this.toolManager.secondaryColor = selectedColor;
            }
        });
    }

    assignPrimaryColor(): string {
        const color = this.storage.getPrimaryColor();
        if (color !== 'empty') {
            return this.storage.getPrimaryColor();
        }
        this.storage.setPrimaryColor('#FFFFFF');
        return '#FFFFFF';
    }

    assignSecondaryColor(): string {
        const color = this.storage.getSecondaryColor();
        if (color !== 'empty') {
            return this.storage.getSecondaryColor();
        }
        this.storage.setSecondaryColor('#0000ff');
        return '#000000';
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