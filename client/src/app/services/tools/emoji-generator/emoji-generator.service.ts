import { Injectable } from '@angular/core';

@Injectable()
export class EmojiGeneratorService {
    private emoji: string;
    protected emojis: string[] = ['',
        '../../../../assets/svg-icons/happy.svg',
        '../../../../assets/svg-icons/pawprint.svg',
        '../../../../assets/svg-icons/leaf.svg',
        '../../../../assets/svg-icons/turkey.svg',
        '../../../../assets/svg-icons/pumpkin.svg'];
    private OFFSET_CANVAS_X: number;
    private width = 20;
    private height = 20;
    private angle: number;

    constructor() {
        this.emoji = '../../../../assets/svg-icons/happy.svg';
        this.angle = 180;
    }

    get _emoji() {
        return this.emoji;
    }

    set _emoji(emoji: string) {
        this.emoji = emoji;
    }

    get _rotationAngle() {
        return this.angle;
    }

    set _rotationAngle(angle: number) {
        this.angle = angle;
    }

    addEmoji(mouseEvent: MouseEvent, canvas: HTMLElement) {
        if (this.emoji !== '') {
            this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;
            canvas.innerHTML +=
                `<image x="${(mouseEvent.pageX - this.OFFSET_CANVAS_X - this.width / 2)}" y="${(mouseEvent.pageY) - this.height / 2}"
        xlink:href="${this.emoji}"' width="${this.width}" height="${this.height}"
        transform="rotate(${this.angle} ${mouseEvent.pageX - this.OFFSET_CANVAS_X } ${(mouseEvent.pageY)})" />
        `;
        }
    }
}
