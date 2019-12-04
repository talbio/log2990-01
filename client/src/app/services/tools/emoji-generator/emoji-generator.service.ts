import { Injectable } from '@angular/core';
import { TransformationService } from 'src/app/services/transformation/transformation.service';
import {AbstractGenerator} from '../../../data-structures/abstract-generator';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import {RendererSingleton} from '../../renderer-singleton';
import {UndoRedoService} from '../../undo-redo/undo-redo.service';
const MIN_ROTATION_STEP = 1;
const MAX_ROTATION_STEP = 15;
const MIN_ROTATION_ANGLE = 0;
const MAX_ROTATION_ANGLE = 359;
const DEFAULT_SCALING_FACTOR = 1;

export enum Emojis {
  NONE = '',
  SMILEY = '../../../../assets/svg-icons/happy.svg',
  CATPAW =  '../../../../assets/svg-icons/pawprint.svg',
  LEAF = '../../../../assets/svg-icons/leaf.svg',
  TURKEY = '../../../../assets/svg-icons/turkey.svg',
  SNOWFLAKE = '../../../../assets/svg-icons/snowflake.svg',
  LIGHTS = '../../../../assets/svg-icons/lights.svg',
  CHRISTMAS_TREE = '../../../../assets/svg-icons/christmas-tree.svg',
  BIRTHDAY = '../../../../assets/svg-icons/birthday.svg',
  CONFETTI = '../../../../assets/svg-icons/confetti.svg',
  BALLOON = '../../../../assets/svg-icons/balloon.svg',
  REINDEER = '../../../../assets/svg-icons/reindeer.svg',
  ELF = '../../../../assets/svg-icons/elf.svg',
  SANTA_HAT = '../../../../assets/svg-icons/santa-hat.svg',
  GIFT = '../../../../assets/svg-icons/gift.svg',
}

@Injectable()
export class EmojiGeneratorService extends AbstractGenerator {

  private emoji: string;
  protected emojis: string[] = [
      Emojis.LEAF,
      Emojis.CHRISTMAS_TREE,
      Emojis.SNOWFLAKE,
      Emojis.REINDEER,
      Emojis.ELF,
      Emojis.GIFT,
      Emojis.LIGHTS,
      Emojis.SANTA_HAT,
      Emojis.BIRTHDAY,
      Emojis.CONFETTI,
      Emojis.BALLOON,
      Emojis.SMILEY,
      Emojis.CATPAW,
      Emojis.TURKEY,
      Emojis.NONE,
    ];
  private width = 100;
  private height = 100;
  private angle: number;
  private scalingFactor: number;
  private rotationStep: number;

  constructor(protected mouse: MousePositionService,
              protected undoRedoService: UndoRedoService,
              private transform: TransformationService) {
    super(mouse, undoRedoService);
    this.emoji = Emojis.LEAF;
    this.angle = MIN_ROTATION_ANGLE;
    this.scalingFactor = DEFAULT_SCALING_FACTOR;
    this.rotationStep = MAX_ROTATION_STEP;
    this.idPrefix = 'emoji';
  }

  getEmojis() {
    return this.emojis;
  }

  set _emoji(emoji: string) {
    this.emoji = emoji;
  }

  get rotationAngle() {
    return this.angle;
  }

  set rotationAngle(angle: number) {
    if (angle > 360) {
      angle = 0;
    } else if (angle < 0) {
      angle = 360;
    } else {
      this.angle = angle;
    }
  }

  get _scalingFactor() {
    return this.scalingFactor;
  }

  set _scalingFactor(factor: number) {
    this.scalingFactor = factor;
  }

  createElement() {
    if (this.emoji !== '') {
      const img = RendererSingleton.renderer.createElement('image', 'svg');
      RendererSingleton.renderer.setAttribute(img, 'id', `emoji${this.currentElementsNumber}`);
      RendererSingleton.renderer.setAttribute(img, 'x', `${(this.xPos - (this.width * this.scalingFactor / 2))}`);
      RendererSingleton.renderer.setAttribute(img, 'y', `${(this.yPos - (this.height * this.scalingFactor / 2))}`);
      RendererSingleton.renderer.setAttribute(img, 'href', `${this.emoji}`);
      RendererSingleton.renderer.setAttribute(img, 'width', `${this.width * this.scalingFactor}`);
      RendererSingleton.renderer.setAttribute(img, 'height', `${this.height * this.scalingFactor}`);
      RendererSingleton.renderer.setAttribute(img, 'transform', this.rotationMatrix());
      RendererSingleton.canvas.appendChild(img);
      this.pushGeneratorCommand(img);
      this.currentElementsNumber ++;
    }
  }

  updateElement(currentChildPosition: number, mouseEvent?: MouseEvent | undefined): void {
    // Needs to be implemented, do nothing
    return;
  }

  finishElement(mouseEvent?: MouseEvent | undefined): void {
    // Needs to be implemented, do nothing
    return;
  }

  rotationMatrix(): string {
    const matrix = this.transform.completeRotationMatrix(this.angle, this.xPos, this.yPos);
    return `matrix(${matrix[0][0]},${matrix[0][1]},${matrix[1][0]},${matrix[1][1]},${matrix[2][0]},${matrix[2][1]})`;
  }

  rotateEmoji(mouseEvent: WheelEvent): void {
    if (mouseEvent.deltaY < MIN_ROTATION_ANGLE) {
        this.angle  += this.rotationStep;
    } else {this.angle  -= this.rotationStep; }
    if (this.angle > MAX_ROTATION_ANGLE) {this.angle  = MIN_ROTATION_ANGLE; }
    if (this.angle  < MIN_ROTATION_ANGLE) {this.angle  = MAX_ROTATION_ANGLE; }

  }

  lowerRotationStep(): void {
      this.rotationStep = MIN_ROTATION_STEP;
  }

  higherRotationStep(): void {
      this.rotationStep = MAX_ROTATION_STEP;
  }
}
