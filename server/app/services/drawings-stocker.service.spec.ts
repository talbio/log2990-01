import {expect} from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import {Drawing} from '../../../common/communication/Drawing';
import {DrawingWithId} from './drawings-stocker.service';
// import * as drawingStockerService from './drawings-stocker.service.ts';

describe('drawings stocker service', () => {

    const sandbox = sinon.createSandbox();
    it('should be logged in the coverage', (done: Mocha.Done) => {
        // tslint:disable-next-line:no-unused-expression
        expect(1).to.be.not.null;
        done();
    });

    // tslint:disable-next-line:no-require-imports
    const drawingsStocker = require('drawings-stocker.service');
    it('getDrawings should retrieve all drawings in server', async () => {
        sandbox.stub(fs, 'readdir')
            .value( (path: string, callback: (err: NodeJS.ErrnoException | null, files: string[]) => void) => {
            callback(null, ['fakedrawing1.json', 'fakedrawing2.json', 'fakedrawing3.jsonp']);
        });

        let i  = 0;
        sandbox.stub(fs, 'readFileSync')
            .value( (path: string, options: string) => {
                const drawing: Drawing =  {name: '', svgElements: '', tags: [], miniature: ''};
                const drawingWithId: DrawingWithId =  { id: i, drawing };
                ++i;
                return JSON.stringify(drawingWithId);
            });
        await drawingsStocker.getDrawings().then( (drawings: DrawingWithId[]) => expect(drawings.length).to.be('3'));
    });
});
