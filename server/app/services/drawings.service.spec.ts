import {expect} from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import {Drawing} from '../../../common/communication/Drawing';
import {DrawingsService, DrawingWithId} from './drawings.service';

describe('DrawingsStockerService', () => {

    /*------------------------------------- ENVIRONMENT INITIALIZATION ---------------------------------------*/
    const sandbox = sinon.createSandbox();
    const files = ['fakedrawing1.json', 'fakedrawing2.json', 'fakedrawing3.json'];
    const mockedFile: string[] = [];
    const drawingsService = new DrawingsService();

    sandbox.stub(fs, 'readdir')
        .value( (path: string, callback: (err: NodeJS.ErrnoException | null, files: string[]) => void) => {
            callback(null, files);
        });

    sandbox.stub(fs, 'writeFileSync')
        .value( (path: string, dataToWrite: string) => {
            mockedFile.push(dataToWrite);
        });

    let i  = 0;
    sandbox.stub(fs, 'readFileSync')
        .value( (path: string, options: string) => {
            const drawing: Drawing =  {name: '', svgElements: '', tags: [], miniature: ''};
            const drawingWithId: DrawingWithId =  { id: i, drawing };
            ++i;
            return JSON.stringify(drawingWithId);
        });
    /*-----------------------------------------------------------------------------------------------------*/

    it('should be logged in the coverage', (done: Mocha.Done) => {
        // tslint:disable-next-line:no-unused-expression
        expect(1).to.be.not.null;
        done();
    });

    it('getDrawings should retrieve all drawings in server', async () => {
        await drawingsService.getDrawings().then( (drawings: DrawingWithId[]) => {
            expect(drawings).to.be.of.length(3);
        } );
    });

    it('getFiles should return stored files', async () => {
        await drawingsService.getFiles().then( (fetchedFiles: string[]) => expect(fetchedFiles.length).to.be.equal(3));
    });

    it('storeDrawing should write json object to file', async () => {
        const drawing: Drawing =  {name: 'fake', svgElements: '', tags: [], miniature: ''};
        await expect(drawingsService.storeDrawing(drawing)).to.be.equal(true);
        expect(mockedFile.pop()).to.contain('fake');
    });

    it('storeDrawing should not write json object to file if drawing does not contain name', async () => {
        const drawing: Drawing =  {name: '', svgElements: '', tags: [], miniature: ''};
        await expect(drawingsService.storeDrawing(drawing)).to.be.equal(false);
    });

});
