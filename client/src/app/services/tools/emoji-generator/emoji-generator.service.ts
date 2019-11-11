
export enum Emojis {
    NONE = '',
    SMILEY = '../../../../assets/svg-icons/happy.svg',
    CATPAW =  '../../../../assets/svg-icons/pawprint.svg',
    LEAF = '../../../../assets/svg-icons/leaf.svg',
    TURKEY = '../../../../assets/svg-icons/turkey.svg',
    PUMPKIN = '../../../../assets/svg-icons/pumpkin.svg',
}

import { Injectable } from '@angular/core';
const MIN_ROTATION_STEP = 1;
const MAX_ROTATION_STEP = 15;
const MIN_ROTATION_ANGLE = 0;
const MAX_ROTATION_ANGLE = 360;
const DEFAULT_SCALING_FACTOR = 1;

@Injectable()
export class EmojiGeneratorService {
    private emoji: string;
    protected emojis: string[] = [Emojis.NONE,
        Emojis.SMILEY,
        Emojis.CATPAW,
        Emojis.LEAF,
        Emojis.TURKEY,
        Emojis.PUMPKIN];
    private currentEmojiNumber: number;
    private OFFSET_CANVAS_X: number;
    private width = 100;
    private height = 100;
    private angle: number;
    private scalingFactor: number;
    private rotationStep: number;

    constructor() {
        this.emoji = Emojis.SMILEY;
        this.angle = MIN_ROTATION_ANGLE;
        this.scalingFactor = DEFAULT_SCALING_FACTOR;
        this.rotationStep = MAX_ROTATION_STEP;
        this.currentEmojiNumber = 0;
    }

    getEmojis() {
        return this.emojis;
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

    get _rotationStep() {
        return this.rotationStep;
    }

    set _rotationStep(step: number) {
        this.rotationStep = step;
    }

    addEmoji(mouseEvent: MouseEvent, canvas: SVGElement) {
        if (this.emoji !== '') {
            this.OFFSET_CANVAS_X = canvas.getBoundingClientRect().left;
            canvas.innerHTML +=
                `<image id="emoji${this.currentEmojiNumber}"
                x="${(mouseEvent.pageX - this.OFFSET_CANVAS_X - (this.width * this.scalingFactor / 2))}"
                y="${(mouseEvent.pageY) - (this.height * this.scalingFactor / 2)}"
        xlink:href="${this.emoji}"' width="${this.width * this.scalingFactor}" height="${this.height * this.scalingFactor}"
        transform="rotate(${this.angle} ${mouseEvent.pageX - this.OFFSET_CANVAS_X} ${(mouseEvent.pageY)})"
        />`;
            this.currentEmojiNumber ++;
        }
    }

    rotateEmoji(mouseEvent: WheelEvent): void {
        if (mouseEvent.deltaY < MIN_ROTATION_ANGLE) {
            this.angle  += this.rotationStep;
        } else {this.angle  -= this.rotationStep; }
        if (this.angle > MAX_ROTATION_ANGLE) {this.angle  = MAX_ROTATION_ANGLE; }
        if (this.angle  < MIN_ROTATION_ANGLE) {this.angle  = MIN_ROTATION_ANGLE; }

    }

    lowerRotationStep(): void {
        this.rotationStep = MIN_ROTATION_STEP;
    }

    higherRotationStep(): void {
        this.rotationStep = MAX_ROTATION_STEP;
    }

}
