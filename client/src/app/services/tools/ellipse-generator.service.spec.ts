/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EllipseGeneratorService } from './ellipse-generator.service';

describe('Service: EllipseGenerator', () => {
  let service: EllipseGeneratorService;
  beforeEach(() => {
    service = new EllipseGeneratorService();
    // TestBed.configureTestingModule({
    //   providers: [EllipseGeneratorService]
    // });
  });

  afterEach(() => {
    service = null;
  });

  it('should return true if the Ellipse child exists after createEllipse is called', () => {

    expect(service.createEllipse).toBeTruthy();
  }));

  it('should return true if the Ellipse child exists after createEllipse is called', () => {

  });
});
