import { Injectable } from '@angular/core';
import {AbstractGenerator} from '../../../data-structures/abstract-generator';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';
import {RendererSingleton} from '../../renderer-singleton';
const MIN_ROTATION_STEP = 1;
const MAX_ROTATION_STEP = 15;
const MIN_ROTATION_ANGLE = 0;
const MAX_ROTATION_ANGLE = 360;
const DEFAULT_SCALING_FACTOR = 1;

export enum Emojis {
  NONE = '',
  SMILEY = '../../../../assets/svg-icons/happy.svg',
  CATPAW =  '../../../../assets/svg-icons/pawprint.svg',
  LEAF = '../../../../assets/svg-icons/leaf.svg',
  TURKEY = '../../../../assets/svg-icons/turkey.svg',
  PUMPKIN = '../../../../assets/svg-icons/pumpkin.svg',
}

@Injectable()
export class EmojiGeneratorService extends AbstractGenerator {

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

    constructor(protected undoRedoService: UndoRedoService) {
        super(undoRedoService);
        this.emoji = Emojis.SMILEY;
        this.angle = MIN_ROTATION_ANGLE;
        this.scalingFactor = DEFAULT_SCALING_FACTOR;
        this.rotationStep = MAX_ROTATION_STEP;
        this.currentEmojiNumber = 0;
    }

    getEmojis() {
        return this.emojis;
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

    createElement(xPosition: number, yPosition: number) {
        if (this.emoji !== '') {
            this.OFFSET_CANVAS_X = RendererSingleton.canvas.getBoundingClientRect().left;
            RendererSingleton.canvas.innerHTML +=
                `<image id="emoji${this.currentEmojiNumber}"
                x="${(xPosition - this.OFFSET_CANVAS_X - (this.width * this.scalingFactor / 2))}"
                y="${(yPosition) - (this.height * this.scalingFactor / 2)}"
        xlink:href="${this.emoji}"' width="${this.width * this.scalingFactor}" height="${this.height * this.scalingFactor}"
        transform="rotate(${this.angle} ${xPosition - this.OFFSET_CANVAS_X} ${(yPosition)})"
        />`;
            this.currentEmojiNumber ++;
        }
    }

    updateElement(xPosition: number, yPosition: number, currentChildPosition: number, mouseEvent?: MouseEvent | undefined): void {
      return;
    }

    finishElement(mouseEvent?: MouseEvent | undefined): void {
      return;
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
