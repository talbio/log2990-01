import {inject, injectable} from 'inversify';
import {Collection, Cursor, MongoClient, MongoError, ObjectId} from 'mongodb';
import {Drawing} from '../../../common/communication/Drawing';
import Types from '../types';
import {FirebaseService} from './firebase.service';

const DB_URL = 'mongodb+srv://admin:admin@team-01-coilt.mongodb.net/test?retryWrites=true&w=majority';
const DATABASE_NAME = 'polydessin';
const DRAWINGS_COLLECTION = 'drawings';

export interface MongoDbDrawing {
    _id: ObjectId;
    drawingMetaData: DrawingMetaData;
    // miniature: string;
    // svgElementsUrl: string;
}

export interface DrawingMetaData {
    name: string;
    tags: string[];
    canvasHeight: number;
    canvasWidth: number;
}

@injectable()
export class MongoDbService {

    // private mongoClient: MongoClient;
    // private db: Db;

    constructor(@inject(Types.FireBaseService) private firebaseService: FirebaseService) {
        this.connectDB();
    }


    private mongo: MongoClient;

    async connectDB(): Promise<void> {
        await MongoClient.connect(DB_URL, { useUnifiedTopology: true, useNewUrlParser: true }, (error: MongoError, client: MongoClient) => {
            // console.log(error);
            // const drawingsCollection: Collection<Drawing> = client.db(DATABASE_NAME).collection(DRAWINGS_COLLECTION);
            // const drawing: Drawing = {id: 123, svgElements: '', tags: [''], miniature: '', name: '', canvasHeight: 0, canvasWidth: 0 };
            // drawingsCollection.insertOne(drawing);

        });
        // return this.mongoClient;

        //  const client = new MongoClient(DB_URL, { useUnifiedTopology: true, useNewUrlParser: true });
        //  await client.connect((err) => {
        //      const drawingsCollection = client.db(DATABASE_NAME).collection(DRAWINGS_COLLECTION);
        //      console.log(drawingsCollection);
        //      client.close();
        //  });
        await this.getDrawings();
    }

    async getDrawings(): Promise<MongoDbDrawing[]> {
        const drawingsMetaData: MongoDbDrawing[] = [];
        await MongoClient.connect(DB_URL, { useUnifiedTopology: true, useNewUrlParser: true }, (error: MongoError, client: MongoClient) => {
            const drawingsCollection: Collection<MongoDbDrawing> = client.db(DATABASE_NAME).collection(DRAWINGS_COLLECTION);
            const drawings: Cursor<MongoDbDrawing> = drawingsCollection.find();
            drawings.forEach( (mongoDbDrawing: MongoDbDrawing) => {
                console.log(mongoDbDrawing._id.toHexString());
                drawingsMetaData.push(mongoDbDrawing);
            });
            // drawingsCollection.findOne({_id: new ObjectId('5dddcffd1c9d440000c9adce')}).then( (drawing) => console.log(drawing));
        });
        return drawingsMetaData;
    }

    async postDrawing(drawing: Drawing): Promise<string> {
        let id = '';
        await MongoClient.connect(DB_URL,
            { useUnifiedTopology: true, useNewUrlParser: true }, async (error: MongoError, client: MongoClient) => {
            const metaData: DrawingMetaData = {
                name: drawing.name,
                tags: drawing.tags,
                canvasHeight: drawing.canvasHeight,
                canvasWidth:  drawing.canvasWidth,
            };
            const drawingsCollection: Collection<MongoDbDrawing | DrawingMetaData> =
                client.db(DATABASE_NAME).collection(DRAWINGS_COLLECTION);
            await drawingsCollection.insertOne(metaData);
            await drawingsCollection.findOne({ name: drawing.name })
                .then((mongoDbDrawing: MongoDbDrawing) => id = mongoDbDrawing._id.toHexString());
        });
        return id;
    }

    async deleteDrawing(id: string): Promise<void> {
        await MongoClient.connect(DB_URL, { useUnifiedTopology: true, useNewUrlParser: true }, (error: MongoError, client: MongoClient) => {
            const drawingsCollection: Collection<Drawing> = client.db(DATABASE_NAME).collection(DRAWINGS_COLLECTION);
            drawingsCollection.deleteOne(drawingsCollection.find({ _id: id }));
        });
    }
}
