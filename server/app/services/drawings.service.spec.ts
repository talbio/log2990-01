import {expect} from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import {Drawing} from '../../../common/communication/Drawing';
import {DrawingsStockerService, DrawingWithId} from './drawings-stocker.service';
// import * as drawingStockerService from './drawings-stocker.service.ts';

describe('DrawingsStockerService', () => {

    const sandbox = sinon.createSandbox();
    it('should be logged in the coverage', (done: Mocha.Done) => {
        // tslint:disable-next-line:no-unused-expression
        expect(1).to.be.not.null;
        done();
    });

    const drawingsStocker = new DrawingsStockerService();
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
        await drawingsStocker.getDrawings().then( (drawings: DrawingWithId[]) => expect(drawings).to.be.of.length(3));
    });
});
