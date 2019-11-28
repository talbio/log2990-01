import { TestBed } from '@angular/core/testing';
import { MousePositionService } from '../../mouse-position/mouse-position.service';
import { GridTogglerService } from '../grid/grid-toggler.service';
import { MagnetismGeneratorService } from './magnetism-generator.service';

describe('MagnetismGeneratorService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            MagnetismGeneratorService, MousePositionService, GridTogglerService],
    }));

    it('should be created', () => {
        const magnetism: MagnetismGeneratorService = TestBed.get(MagnetismGeneratorService);
        expect(magnetism).toBeTruthy();
    });

    it('#setMovementDirection should set the right direction', () => {
    const magnetism: MagnetismGeneratorService = TestBed.get(MagnetismGeneratorService);
    // movement is initialized as being false
    magnetism.movementMap.forEach((direction) => { expect(direction).not.toBeTruthy(); });
    // set movement in positive direction (down and right)
    const positiveMouseMove = {movementX: 20, movementY: 20};
    magnetism.setMovementDirection(positiveMouseMove as MouseEvent);
    expect(magnetism.movementMap.get('up')).not.toBeTruthy();
    expect(magnetism.movementMap.get('down')).toBeTruthy();
    expect(magnetism.movementMap.get('left')).not.toBeTruthy();
    expect(magnetism.movementMap.get('right')).toBeTruthy();

    // set movement in negative direction (left and up)
    const negativeMouseMove = {movementX: -20, movementY: -20};
    magnetism.setMovementDirection(negativeMouseMove as MouseEvent);
    expect(magnetism.movementMap.get('up')).toBeTruthy();
    expect(magnetism.movementMap.get('down')).not.toBeTruthy();
    expect(magnetism.movementMap.get('left')).toBeTruthy();
    expect(magnetism.movementMap.get('right')).not.toBeTruthy();

    });

    it('#isCloseEnough should return true if distance is less than half a grid square size', () => {
        const magnetism: MagnetismGeneratorService = TestBed.get(MagnetismGeneratorService);
        const grid: GridTogglerService = TestBed.get(MagnetismGeneratorService);
        grid._gridSize = 100;
        let distanceToLine = 49;
        expect(magnetism.isCloseEnough(distanceToLine)).toBeTruthy();
        distanceToLine = 51;
        expect(magnetism.isCloseEnough(distanceToLine)).not.toBeTruthy();
    });

    it('#isOutOfCanvasBounderies should detect if translation would be out of bounderies', () => {
        const magnetism: MagnetismGeneratorService = TestBed.get(MagnetismGeneratorService);
        // where parameters are selectorLeftSide(or top), selectorRightSide(or bottom), movement, canvas width(or height)
        expect(magnetism.isOutOfBounderies(50, 100, 10, 200)).not.toBeTruthy();
        expect(magnetism.isOutOfBounderies(50, 100, 10, 100)).toBeTruthy();
        expect(magnetism.isOutOfBounderies(10, 20, -20, 100)).toBeTruthy();
        expect(magnetism.isOutOfBounderies(10, 20, -2, 100)).not.toBeTruthy();
     });

    it('#getTranslationWithMagnetismValue() should return values that get the selected dot to closest line', () => {
        // moving horizontally, closest line is at x = 100
        const magnetism: MagnetismGeneratorService = TestBed.get(MagnetismGeneratorService);
        const positiveMouseMove = {movementX: 5, movementY: 0};
        magnetism.setMovementDirection(positiveMouseMove as MouseEvent);
        const grid: GridTogglerService = TestBed.get(MagnetismGeneratorService);
        grid._gridSize = 100;
        const mousePosition: MousePositionService = TestBed.get(MousePositionService);
        mousePosition.canvasMousePositionX = 90;
        mousePosition.canvasMousePositionY = 90;
        spyOn(magnetism, 'isOutOfCanvasBounderies').and.returnValue(false);
        const translationValue: number[] = magnetism.getTranslationWithMagnetismValue();
        expect(translationValue[0]).toEqual(100);
        expect(translationValue[1]).toEqual(0);
    });

});
