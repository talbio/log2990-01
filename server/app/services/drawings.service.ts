import * as fs from 'fs';
import {injectable} from 'inversify';
import 'reflect-metadata';
import {Drawing} from '../../../common/communication/Drawing';

export interface DrawingWithId {
    id: number;
    drawing: Drawing;
}

@injectable()
export class DrawingsService {

    private currentId: number;

    private storeData = (data: DrawingWithId, path: string) => {
        try {
            fs.writeFileSync(path, JSON.stringify(data, null, 2));
        } catch (err) {
            console.error(err);
        }
    }

    private loadFile = (path: string) => {
        try {
            return JSON.parse(fs.readFileSync(path, 'utf8') as string);
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    constructor() {
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

    async getDrawings(): Promise<DrawingWithId[]> {
        const drawingsWithIds: DrawingWithId[] = [];
        const dirname  = './app/storage/';
        return new Promise(async (resolve, reject) => {
            await this.getFiles().then( (files: string[]) => {
                if (files.length !== 0) {
                    files.forEach((fileName: string) => drawingsWithIds.push(this.loadFile(dirname + fileName)));
                }
                resolve(drawingsWithIds);
            });
        });
    }

    storeDrawing(drawing: Drawing): boolean {
        if (!drawing.name) {
            return false;
        }
        const drawingWithId: DrawingWithId = {id: this.currentId, drawing};
        this.storeData(drawingWithId, './app/storage/drawing' + this.currentId + '.json');
        this.generateNextId();
        return true;
    }

    getDrawing(id: string) {
        return this.loadFile('/../storage/drawing' + id + '.json');
    }

    private generateNextId() {
        this.currentId++;
    }
}
