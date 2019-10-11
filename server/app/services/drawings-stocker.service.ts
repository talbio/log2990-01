import * as fs from 'fs';
import {injectable} from 'inversify';
import 'reflect-metadata';
import {Drawing} from '../../../common/communication/Drawing';

interface DrawingWithId {
    id: number;
    drawing: Drawing;
}

@injectable()
export class DrawingsStockerService {

    private currentId: number;

    private storeData = (data: DrawingWithId, path: string) => {
        try {
            console.log('reussi');
            fs.writeFileSync(path, JSON.stringify(data, null, 2));
        } catch (err) {
            console.error(err);
        }
    }

    private loadData = (path: string) => {
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

    storeDrawing(drawing: Drawing) {
        const id: number = this.generateNextId();
        const drawingWithId: DrawingWithId = { id, drawing};
        this.storeData(drawingWithId, './app/storage/drawing' + id + '.json');
    }

    getDrawing(id: string) {
        return this.loadData('/../storage/drawing' + id + '.json');
    }

    private generateNextId(): number {
        console.log(this.currentId);
        return ++this.currentId;
    }
}
