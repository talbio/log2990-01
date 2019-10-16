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
    private currentEmojiNumber: number;
    private OFFSET_CANVAS_X: number;
    private width = 100;
    private height = 100;
    private angle: number;
    private scalingFactor: number;

    constructor() {
        this.emoji = '../../../../assets/svg-icons/happy.svg';
        this.angle = 0;
        this.scalingFactor = 2;
        this.currentEmojiNumber = 0;
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

    get _scalingFactor() {
        return this.scalingFactor;
    }

    set _scalingFactor(factor: number) {
        this.scalingFactor = factor;
    }

    addEmoji(mouseEvent: MouseEvent, canvas: HTMLElement) {
        if (this.emoji !== '') {
            this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;
            canvas.innerHTML +=
                `<image id="emoji${this.currentEmojiNumber}"
                x="${(mouseEvent.pageX - this.OFFSET_CANVAS_X - (this.width * this.scalingFactor / 2))}" 
                y="${(mouseEvent.pageY) - (this.height * this.scalingFactor / 2)}"
        xlink:href="${this.emoji}"' width="${this.width * this.scalingFactor}" height="${this.height * this.scalingFactor}"
        transform="rotate(${this.angle} ${mouseEvent.pageX - this.OFFSET_CANVAS_X} ${(mouseEvent.pageY)})"
        />
        `;
        }
    }

    rotateEmoji(mouseEvent: WheelEvent): void {
        if (mouseEvent.deltaY < 0) {
            this._rotationAngle += 10;
        } else {this._rotationAngle -= 10; }
        if (this._rotationAngle > 360) {this._rotationAngle = 360; }
        if (this._rotationAngle < 0) {this._rotationAngle = 0; }
    }
}
