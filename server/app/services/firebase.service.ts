import * as admin from 'firebase-admin';
import * as fs from 'fs';
import {injectable} from 'inversify';
import {Drawing} from '../../../common/communication/Drawing';
import {MongoDbDrawing} from './mongo-db.service';

export interface DrawingContent {
    svgElements: string;
    miniature: string;
}

/**
 * @desc: to setup your serviceAccountKey,
 * please follow this link: https://firebase.google.com/docs/database/admin/start/
 */
@injectable()
export class FirebaseService {
    private readonly SERVICE_ACCOUNT_KEY = './app/services/serviceAccountKey.json';
    private readonly DRAWINGS_COLLECTION = '/drawings';
    private readonly DATABASE_URL = 'https://polydessin-f22c2.firebaseio.com';

    private db: FirebaseFirestore.Firestore;
    private readonly drawingsCollection: FirebaseFirestore.CollectionReference;

    constructor() {
        try {
            const serviceAccount = JSON.parse(fs.readFileSync(this.SERVICE_ACCOUNT_KEY, 'utf8') as string);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: this.DATABASE_URL,
            });
            this.db = admin.firestore();
            this.drawingsCollection = this.db.collection(this.DRAWINGS_COLLECTION);
        } catch (error) {
            console.error('fireBase connection failed ! The error was: ' + error);
        }
    }

    async getDrawing(mongoDbDrawing: MongoDbDrawing): Promise<DrawingContent | Error | undefined> {
        await this.assertDrawingsCollectionIsDefined();

        let drawingContent: DrawingContent | undefined = {svgElements: '', miniature: ''};
        const drawingDoc = this.drawingsCollection.doc(mongoDbDrawing._id.toHexString());
        await drawingDoc.get()
            .then( (doc) => {
                if (!doc.exists) {
                    drawingContent = undefined;
                } else {
                    (drawingContent as DrawingContent).svgElements = (doc.data() as FirebaseFirestore.DocumentData).svgElements;
                    (drawingContent as DrawingContent).miniature = (doc.data() as FirebaseFirestore.DocumentData).miniature;
                }
            });
        return drawingContent;
    }

    async postDrawing(drawing: Drawing): Promise<void | Error> {
        await this.assertDrawingsCollectionIsDefined();
        const drawingDoc = this.drawingsCollection.doc(drawing.id);
        await drawingDoc.set({
            miniature: drawing.miniature,
            svgElements: drawing.svgElements,
        });
    }

    async deleteDrawing(id: string): Promise<void | Error> {
        await this.assertDrawingsCollectionIsDefined();
        const drawingDoc = this.drawingsCollection.doc(id);
        await drawingDoc.delete();
    }

    private async assertDrawingsCollectionIsDefined(): Promise<void | Error> {
        if (!this.drawingsCollection) {
            await Promise.reject(new Error('could not find drawings collection!'));
        }
    }
}
