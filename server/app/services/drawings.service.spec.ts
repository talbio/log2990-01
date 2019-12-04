import * as assert from 'assert';
import { expect } from 'chai';
import 'mocha';
import 'reflect-metadata';
import {Drawing} from '../../../common/communication/Drawing';
import {DrawingsService} from './drawings.service';
import {FirebaseService} from './firebase.service';
import { MongoDbService} from './mongo-db.service';

/**
 * @desc: these tests suppose that the connection to mongo or firebase is not set.
 */
describe('DrawingsService', () => {

    const firebaseService = new FirebaseService();
    const mongoDbService = new MongoDbService();
    const drawingService = new DrawingsService(mongoDbService, firebaseService);

    it('postDrawing should return false if name is not defined', async () => {
        const fakeDrawing = {} as Drawing;
        await drawingService.postDrawing(fakeDrawing).then(
            (success) => expect(success).to.be.false);
    });

    it('postDrawing should return false if post request to mongo or firebase failed', async () => {
        const fakeDrawing = {name: 'fake'} as Drawing;
        await drawingService.postDrawing(fakeDrawing).then(
            (success) => expect(success).to.be.false);
    });

    it('deleteDrawing should return false if delete request to mongo or firebase failed', async () => {
        await drawingService.deleteDrawing('fake').then(
            (success) => expect(success).to.be.false);
    });

    it('getDrawings should throw error if get request to mongo or firebase failed', async () => {
        await drawingService.getDrawings()
            .then( () => assert.fail( 'Error not thrown'))
            .catch( () => expect(true).be.true);
    });
});
