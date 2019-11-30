import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { ModalManagerSingleton } from './../modal-manager-singleton';

interface IShortcut {
    description: string;
    keys: string;
}

@Component({
    selector: 'app-user-manual-dialog',
    templateUrl: './user-manual-dialog.component.html',
    styleUrls: ['./user-manual-dialog.component.scss'],
})

export class UserManualDialogComponent {
    protected readonly PENCIL = '../../../../assets/user-manual-icons/pencil.png';
    protected readonly SHAPE = '../../../../assets/user-manual-icons/shape.png';
    protected readonly SELECTION = '../../../../assets/user-manual-icons/selection-tool.png';
    protected readonly GRID = '../../../../assets/user-manual-icons/grid.png';
    protected readonly UNDO = '../../../../assets/user-manual-icons/undo.png';
    protected readonly REDO = '../../../../assets/user-manual-icons/redo.png';
    protected readonly COLOR = '../../../../assets/user-manual-icons/color.png';
    protected readonly NEW = '../../../../assets/user-manual-icons/new-drawing.png';
    protected readonly SAVE = '../../../../assets/user-manual-icons/saveDrawing.png';
    protected readonly OPEN = '../../../../assets/user-manual-icons/openDrawing.png';
    protected readonly CLIPBOARD = '../../../../assets/user-manual-icons/clipboard.png';
    protected readonly DIALOG_TITLE = 'Manuel d\'instructions';
    protected readonly userManualSections: string[] = ['Barre latérale', 'Outils d\'écriture',
    'Outils de formes', 'Liste des raccourcis'];
    protected readonly FILE_SHORTCUTS: IShortcut[] =
        [{ description: 'Créer un nouveau dessin', keys: 'Ctrl-O' },
        { description: 'Sauvegarder le dessin', keys: 'Ctrl-S' },
        { description: 'Voir la galerie de dessins', keys: 'Ctrl-G' },
        { description: 'Exporter le dessin', keys: 'Ctrl-E' }];

    protected readonly MANIPULATION_SHORTCUTS: IShortcut[] =
        [{ description: 'Couper la sélection', keys: 'Ctrl-X' },
        { description: 'Copier la sélection', keys: 'Ctrl-C' },
        { description: 'Coller la sélection ', keys: 'Ctrl-V' },
        { description: 'Dupliquer la sélection ', keys: 'Ctrl-D' },
        { description: 'Supprimer la sélection', keys: 'Supprimer' },
        { description: 'Tout sélectionner', keys: 'Ctrl-A' },
        { description: 'Annuler', keys: 'Ctrl-Z' },
        { description: 'Refaire', keys: 'Ctrl-Shift-Z' },
        ];
    protected readonly TOOL_SHORTCUTS: IShortcut[] =
        [{ description: 'Crayon', keys: 'C' },
        { description: 'Stylo ', keys: 'Y' },
        { description: 'Pinceau', keys: 'W' },
        { description: 'Plume', keys: 'P' },
        { description: 'Aérosol', keys: 'A' },
        { description: 'Efface', keys: 'E' },
        { description: 'Applicateur de couleur ', keys: 'R' },
        { description: 'Pipette', keys: 'I' },
        { description: 'Ligne', keys: 'L' },
        { description: 'Rectangle', keys: '1' },
        { description: 'Ellipse', keys: '2' },
        { description: 'Polygone', keys: '3' },
        { description: 'Étampe', keys: '4'},
        { description: 'Sélection', keys: 'S' },
        ];

    protected showUserManualSection: Map<string, boolean>;
    private modalManager = ModalManagerSingleton.getInstance();

    constructor(private dialogRef: MatDialogRef<UserManualDialogComponent>,
    ) {
        this.modalManager._isModalActive = true;
        this.showUserManualSection = new Map();
        this.userManualSections.forEach((section) => {
            this.showUserManualSection.set(section, false);
        });
        this.afterClose();
    }

    close(): void {
        this.dialogRef.close();
    }
    afterClose(): void {
        this.dialogRef.afterClosed().subscribe(() => {
        this.modalManager._isModalActive = false;
    });
    }
}
