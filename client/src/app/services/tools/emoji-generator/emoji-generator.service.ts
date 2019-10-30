import { MousePositionService } from './../../mouse-position/mouse-position.service';

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
    private width = 100;
    private height = 100;
    private angle: number;
    private scalingFactor: number;
    private rotationStep: number;

    constructor(private mousePosition: MousePositionService) {
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

    addEmoji(canvas: SVGElement) {
        if (this.emoji !== '') {
            canvas.innerHTML +=
                `<image id="emoji${this.currentEmojiNumber}"
                x="${(this.mousePosition.canvasMousePositionX - (this.width * this.scalingFactor / 2))}"
                y="${this.mousePosition.canvasMousePositionY - (this.height * this.scalingFactor / 2)}"
        xlink:href="${this.emoji}"' width="${this.width * this.scalingFactor}" height="${this.height * this.scalingFactor}"
        transform="rotate(${this.angle} ${this.mousePosition.canvasMousePositionX} ${this.mousePosition.canvasMousePositionY})"
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

    clone(item: SVGElement): SVGElement {
      const newItem = item.cloneNode() as SVGElement;
      newItem.setAttribute('id', 'emoji' + this.currentEmojiNumber++);
      return newItem;
      /*
      const x = parseFloat(item.getAttribute('x') as unknown as string) + 10;
      const y = parseFloat(item.getAttribute('y') as unknown as string) + 10;
      const h = parseFloat(item.getAttribute('height') as unknown as string);
      const w = parseFloat(item.getAttribute('width') as unknown as string);
      const angle = item.getAttribute('transform');
      const newItem =
        `<image id="emoji${this.currentEmojiNumber}"
        x="${x}" y="${y}" xlink:href="${this.emoji}"
        width="${w}" height="${h}"
        transform="${angle}"/>`;
      this.currentEmojiNumber++;
      return newItem;*/
    }
}
