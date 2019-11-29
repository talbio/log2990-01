import * as fs from 'fs';
import {inject, injectable} from 'inversify';
import 'reflect-metadata';
import {Drawing} from '../../../common/communication/Drawing';
import Types from '../types';
import {DrawingContent, FirebaseService} from './firebase.service';
import {MongoDbDrawing, MongoDbService} from './mongo-db.service';

@injectable()
export class DrawingsService {

    private readonly DIRECTORY_NAME  = './app/storage/';
    private currentId: number;

    private storeData = (data: Drawing, path: string) => {
        try {
            fs.writeFileSync(path, JSON.stringify(data, null, 2));
        } catch (err) {
            console.error(err);
        }
    }

    // private loadFile = (path: string) => {
    //     try {
    //         return JSON.parse(fs.readFileSync(path, 'utf8') as string);
    //     } catch (err) {
    //         console.error(err);
    //         return false;
    //     }
    // }

    constructor(@inject(Types.MongoDbService) private mongoDb: MongoDbService,
                @inject(Types.FireBaseService) private firebaseService: FirebaseService) {
        this.currentId = 0;
        void this.getIdFromLastSession();
    }

    async getIdFromLastSession() {
        // the id is just the number of files
        await this.getFiles()
            .then((files: string[]) => this.currentId = files.length);
    }

    async getFiles(): Promise<string[]> {
        const dir = './app/storage';
        return new Promise((resolve, reject) => {
            fs.readdir(dir, (err, files) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else if (files) {
                    resolve(files.filter( (fileName: string) => fileName.includes('drawing')));
                } else {
                    resolve([]);
                }
            });
        });
    }

    async getDrawings(): Promise<Drawing[]> {
        const drawings: Drawing[] = [];
        let mongoDbDrawings: MongoDbDrawing[] = [];
        await this.mongoDb.getDrawings().then( (drawingsMetaData: MongoDbDrawing[]) => mongoDbDrawings = drawingsMetaData);
        await mongoDbDrawings.forEach( (mongoDbDrawing: MongoDbDrawing) => {
            this.firebaseService.getDrawing(mongoDbDrawing).then(
                (drawingContent: DrawingContent) => {
                    if (drawingContent) {
                        const drawing: Drawing = {
                            id: Number(mongoDbDrawing._id.toHexString()),
                            name: mongoDbDrawing.drawingMetaData.name,
                            tags: mongoDbDrawing.drawingMetaData.tags,
                            svgElements: drawingContent.svgElements,
                            miniature: drawingContent.miniature,
                            canvasWidth: mongoDbDrawing.drawingMetaData.canvasWidth,
                            canvasHeight: mongoDbDrawing.drawingMetaData.canvasHeight,
                        };
                        drawings.push(drawing);
                    }});
        });
        return drawings;

        // return new Promise(async (resolve, reject) => {
        //     await this.getFiles().then( (files: string[]) => {
        //         if (files.length !== 0) {
        //             files.forEach((fileName: string) => drawings.push(this.loadFile(this.DIRECTORY_NAME + fileName)));
        //         }
        //         resolve(drawings);
        //     });
        // });
    }

    async postDrawing(drawing: Drawing): boolean {
        if (!drawing.name) {
            return false;
        }
        await this.mongoDb.postDrawing(drawing).then( (id: string) => {
            drawing.id = id;
            this.firebaseService.postDrawing(drawing);
        });
        return true;
        // if (!drawing.name) {
        //     return false;
        // }
        // drawing.id = this.currentId;
        // this.storeData(drawing, this.DIRECTORY_NAME + 'drawing' + this.currentId + '.json');
        // this.generateNextId();
        // return true;
    }

    async deleteDrawing(id: string): Promise<void> {

        this.mongoDb.deleteDrawing(id);

        // this.getFiles().then( (files: string[]) => files.forEach( (file: string) => {
        //     if (file.includes(id)) {
        //         fs.unlink(this.DIRECTORY_NAME + file, (err) => {
        //             if (err) {
        //                 throw err;
        //             }
        //         });
        //     }
        // }));
    }

    private generateNextId() {
        this.currentId++;
    }
}
