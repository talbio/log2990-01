import {inject, injectable} from 'inversify';
import 'reflect-metadata';
import {Drawing} from '../../../common/communication/Drawing';
import Types from '../types';
import {DrawingContent, FirebaseService} from './firebase.service';
import {MongoDbDrawing, MongoDbService} from './mongo-db.service';

@injectable()
export class DrawingsService {

    constructor(@inject(Types.MongoDbService) private mongoDb: MongoDbService,
                @inject(Types.FireBaseService) private firebaseService: FirebaseService) {
    }

    async getDrawings(): Promise<Drawing[] | Error> {
        const drawings: Drawing[] = [];
        await this.mongoDb.getDrawings().then(async (mongoDbDrawings: MongoDbDrawing[]) => {
            await Promise.all(mongoDbDrawings.map(async (mongoDbDrawing: MongoDbDrawing) => {
                await this.firebaseService.getDrawing(mongoDbDrawing).then(
                    (drawingContent: DrawingContent) => {
                        if (drawingContent) {
                            const drawing: Drawing = {
                                id: mongoDbDrawing._id.toHexString(),
                                name: mongoDbDrawing.name,
                                tags: mongoDbDrawing.tags,
                                svgElements: drawingContent.svgElements,
                                miniature: drawingContent.miniature,
                                canvasWidth: mongoDbDrawing.canvasWidth,
                                canvasHeight: mongoDbDrawing.canvasHeight,
                            };
                            drawings.push(drawing);
                        }}).catch( (err: Error) => Promise.reject(err));
            }));
        }).catch( (err: Error) => Promise.reject(err));
        return drawings;
    }

    async postDrawing(drawing: Drawing): Promise<boolean> {
        let success = false;
        if (!drawing.name) {
            return success;
        }

        await this.mongoDb.postDrawing(drawing).then( async (id: string) => {
            drawing.id = id;
            await this.firebaseService.postDrawing(drawing)
                .then( () => success = true)
                .catch( () => success = false);
        }).catch( () => success = false);

        return success;
    }

    async deleteDrawing(id: string): Promise<boolean> {
        let success = false;
        await this.mongoDb.deleteDrawing(id)
            .then( () => success = true)
            .catch( () => success = false);
        await this.firebaseService.deleteDrawing(id)
            .then( () => success = true)
            .catch( () => success = false);
        return success;
    }
}
