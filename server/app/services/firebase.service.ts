import * as admin from 'firebase-admin';
import * as fs from 'fs';
import {injectable} from 'inversify';
import {Drawing} from '../../../common/communication/Drawing';
import {MongoDbDrawing} from './mongo-db.service';

export interface DrawingContent {
    svgElements: string;
    miniature: string;
}

@injectable()
export class FirebaseService {
    private readonly SERVICE_ACCOUNT_KEY = './app/services/serviceAccountKey.json';
    private readonly DRAWINGS_COLLECTION = 'drawings';

    private db: FirebaseFirestore.Firestore;
    private drawingsCollection: FirebaseFirestore.CollectionReference;

    constructor() {
        const serviceAccount = JSON.parse(fs.readFileSync(this.SERVICE_ACCOUNT_KEY, 'utf8') as string);
        if (!admin.app) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: 'https://polydessin-f22c2.firebaseio.com',
            });
            this.db = admin.firestore();
            this.drawingsCollection = this.db.collection(this.DRAWINGS_COLLECTION);
        }
    }

    async readDrawingsCollection() {
        this.drawingsCollection.get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    console.log(doc.id, '=>', doc.data());
                });
            })
            .catch((err) => {
                console.log('Error getting documents', err);
            });

        const aTuringRef = this.drawingsCollection.doc('test1');
        await aTuringRef.set({
            miniature: 'test',
            svgElements: 'test',
        });
    }

    async getDrawing(mongoDbDrawing: MongoDbDrawing): Promise<DrawingContent> {
        const drawingContent: DrawingContent = {svgElements: '', miniature: ''};
        const drawingDoc = this.drawingsCollection.doc(mongoDbDrawing._id.toHexString());
        await drawingDoc.get()
            .then( (doc) => {
                if (!doc.exists) {
                    console.log('No such document!');
                } else {
                    console.log('Document data:', doc.data());
                    drawingContent.svgElements = (doc.data() as FirebaseFirestore.DocumentData).svgElements;
                    drawingContent.miniature = (doc.data() as FirebaseFirestore.DocumentData).miniature;
                }
            })
            .catch( (err) => {
                console.log('Error getting document', err);
            });
        return drawingContent;
    }

    async postDrawing(drawing: Drawing) {
        const drawingDoc = this.drawingsCollection.doc(drawing.id);
        await drawingDoc.set({
            miniature: drawing.miniature,
            svgElements: drawing.svgElements,
        });
    }
}
