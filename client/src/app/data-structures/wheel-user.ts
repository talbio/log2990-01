export interface WheelUser {
  rotationStep: number;
  angle: number;

  setRotationAngle(angle: number, ceiling: number): void;
  lowerRotationStep(): void;
  higherRotationStep(): void;
}
