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
        this.currentId = await this.getNumberOfFiles();
    }

    async getNumberOfFiles(): Promise<number> {
        const dir = './app/storage';
        return new Promise((resolve, reject) => {
            fs.readdir(dir, (err, files) => {
                files ? resolve(files.length) : resolve(0);
            });
        });
    }

    async getDrawings(): Promise<DrawingWithId[]> {
        const drawingsWithIds: DrawingWithId[] = [];
        const dirname  = './app/storage/';
        return new Promise((resolve, reject) => {
            fs.readdir(dirname, (err, filenames) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                filenames.forEach((fileName) => drawingsWithIds.push(this.loadFile(dirname + fileName)));
                resolve(drawingsWithIds);
            });
        });
    }

    storeDrawing(drawing: Drawing): boolean {
        if (!drawing.name) {
            return false;
        }
        const id: number = this.generateNextId();
        const drawingWithId: DrawingWithId = {id, drawing};
        this.storeData(drawingWithId, './app/storage/drawing' + id + '.json');
        return true;
    }

    getDrawing(id: string) {
        return this.loadFile('/../storage/drawing' + id + '.json');
    }

    private generateNextId(): number {
        return ++this.currentId;
    }
}
