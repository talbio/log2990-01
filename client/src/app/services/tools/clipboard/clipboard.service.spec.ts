// import { TestBed } from '@angular/core/testing';
// import { PenGeneratorService } from 'src/app/services/tools/pen-generator/pen-generator.service';
// import { MousePositionService } from './../../mouse-position/mouse-position.service';
// import { BrushGeneratorService } from './../brush-generator/brush-generator.service';
// import { EllipseGeneratorService } from './../ellipse-generator/ellipse-generator.service';
// import { EmojiGeneratorService } from './../emoji-generator/emoji-generator.service';
// import { LineGeneratorService } from './../line-generator/line-generator.service';
// import { ObjectSelectorService } from './../object-selector/object-selector.service';
// import { PencilGeneratorService } from './../pencil-generator/pencil-generator.service';
// import { PolygonGeneratorService } from './../polygon-generator/polygon-generator.service';
// import { RectangleGeneratorService } from './../rectangle-generator/rectangle-generator.service';
// import { ClipboardService } from './clipboard.service';

// let service: ClipboardService;

// const testSubject: jasmine.SpyObj<SVGElement> =
// jasmine.createSpyObj('SVGElement', ['setAttribute', 'getAttribute', 'getBoundingClientRect', 'cloneNode', 'tagName']);
// testSubject.setAttribute.and.callThrough();

// const DRAWING_SERVICES = [
//   RectangleGeneratorService,
//   EllipseGeneratorService,
//   PenGeneratorService,
//   EmojiGeneratorService,
//   PencilGeneratorService,
//   BrushGeneratorService,
//   LineGeneratorService,
//   ObjectSelectorService,
//   PolygonGeneratorService,
//   MousePositionService,
// ];

// describe('Service: Clipboard', () => {
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       providers: [ClipboardService, ...DRAWING_SERVICES]
//     });
//     service = TestBed.get(ClipboardService);
//   });

//   const setUpTestSubject = (width: number, height: number, x: number, y: number): SVGElement => {
//     testSubject.setAttribute('id', 'expectedClone');
//     testSubject.setAttribute('height', height as unknown as string);
//     testSubject.setAttribute('width', width as unknown as string);
//     testSubject.setAttribute('stroke', 'transparent');
//     testSubject.setAttribute('fill', 'black');
//     testSubject.setAttribute('x', x as unknown as string);
//     testSubject.setAttribute('y', y as unknown as string);
//     testSubject.setAttribute('tagName', 'rect');
//     return testSubject.correspondingElement;
//   };

//   describe('clone()', () => {
//     it('should receive a perfect clone (ignoring the id) of the SVG passed in parameter', () => {
//       const initialSVGElement = setUpTestSubject(100, 100, 100, 100);
//       expect(initialSVGElement.tagName).toEqual('rect');
//       const clonedSVGElement: SVGElement = service.clone(initialSVGElement);
//       expect(testSubject.cloneNode).toHaveBeenCalled();
//       expect(clonedSVGElement).toBeTruthy();
//       clonedSVGElement.setAttribute('id', 'expectedClone');
//       expect(clonedSVGElement).toEqual(testSubject);
//     });
//   });

//   describe('slide()', () => {
//     it('should slide further for each consecultive slide a given element and not drive it out of the canvas', () => {
//       const svgElement = setUpTestSubject(100, 100, 100, 100);
//       svgElement.setAttribute('transform', 'translate(2 5) rotate(0 850 250');

//       service.slide(svgElement);
//       expect(svgElement.getAttribute('transform')).toEqual('translate(7 10) rotate(0 850 250');

//       service.slide(svgElement);
//       expect(svgElement.getAttribute('transform')).toEqual('translate(12 15) rotate(0 850 250');

//       service.slide(svgElement);
//       const transform = svgElement.getAttribute('transform') as string;
//       const newTransform = transform.split('(');
//       const newTranslate = newTransform[1].split(')');
//       const theTranslate = newTranslate[0].split(' ');
//       const x = parseFloat(theTranslate[0]);
//       const y = parseFloat(theTranslate[1]);
//       let isOnCanvas = false;
//       if (x <= 100 && y <= 200) {
//         isOnCanvas = true;
//       }
//       expect(isOnCanvas).toBe(true);
//     });

  // it('should direct the direction of slide to not step out of the canvas (getSlideSide())', () => {
  //   const itemToSlide = setUpTestSubject(100, 100, 800, 200);

  //   const firstSlideSide = this.getSlideLength(itemToSlide, 1);

  //   const secondSlideSide = this.getSlideLength(itemToSlide, 24);

  //   expect(secondSlideSide[0]).toBe(true);

  //   itemToSlide.setAttribute('transform', 'translate(2 5) rotate(0 850 250');
  // });

//   });
// });
