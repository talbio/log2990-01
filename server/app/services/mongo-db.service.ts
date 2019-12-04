import {injectable} from 'inversify';
import {Collection, Cursor, MongoClient, MongoError, ObjectId} from 'mongodb';
import {Drawing} from '../../../common/communication/Drawing';

const DB_URL = 'mongodb+srv://admin:admin@team-01-coilt.mongodb.net/test?retryWrites=true&w=majority';
const DATABASE_NAME = 'polydessin';
const DRAWINGS_COLLECTION = 'drawings';
const MONGO_OPTIONS = { useUnifiedTopology: true, useNewUrlParser: true };

export interface MongoDbDrawing {
    _id: ObjectId;
    name: string;
    tags: string[];
    canvasHeight: number;
    canvasWidth: number;
}

export interface DrawingMetaData {
    name: string;
    tags: string[];
    canvasHeight: number;
    canvasWidth: number;
}

@injectable()
export class MongoDbService {

    private mongoClient: MongoClient;
    private drawingsCollection: Collection<MongoDbDrawing | DrawingMetaData>;

    constructor() {
        void this.connectDb();
    }

    async connectDb(): Promise<void> {
        if (!this.mongoClient) {
            try {
                await MongoClient.connect(DB_URL, MONGO_OPTIONS, (error: MongoError, client: MongoClient) => {
                    this.mongoClient = client;
                });
            } catch (error) {
                console.log('MongoDb connection failed ! The error was: ' + error);
            }
        }
    }

    async getDrawings(): Promise<MongoDbDrawing[] | Error> {
        await this.retrieveDrawingCollection().catch( (error) => Promise.reject(error));
        const mongoDbDrawings: MongoDbDrawing[] = [];
        const drawingsCollection: Collection<MongoDbDrawing> = await this.mongoClient.db(DATABASE_NAME).collection(DRAWINGS_COLLECTION);
        const drawings: Cursor<MongoDbDrawing> = await drawingsCollection.find();
        await drawings.forEach( (mongoDbDrawing: MongoDbDrawing) => {
            mongoDbDrawings.push(mongoDbDrawing);
        });
        return mongoDbDrawings;
    }

    async postDrawing(drawing: Drawing): Promise<string | Error> {
        await this.retrieveDrawingCollection().catch( (error) => Promise.reject(error));

        let id = '';
        const metaData: DrawingMetaData = {
            name: drawing.name,
            tags: drawing.tags,
            canvasHeight: drawing.canvasHeight,
            canvasWidth:  drawing.canvasWidth,
        };

        await this.drawingsCollection.insertOne(metaData);
        await this.drawingsCollection.find({}).sort({_id: -1}).limit(1).forEach(
            // only one element
            (lastInserted: MongoDbDrawing) => id = lastInserted._id.toHexString());
        return id;
    }

    async deleteDrawing(id: string): Promise<void | Error> {
        await this.retrieveDrawingCollection().catch( (error) => Promise.reject(error));
        await this.drawingsCollection.deleteOne({ _id: new ObjectId(id) }).catch( (error) => Promise.reject(error));
    }

    private async retrieveDrawingCollection(): Promise<void | Error> {
        if (!this.mongoClient) {
            return Promise.reject(new Error('MongoClient could not have been initialized'));
        }
        try {
            this.drawingsCollection = await this.mongoClient.db(DATABASE_NAME).collection(DRAWINGS_COLLECTION);
        } catch (error) {
            await Promise.reject(error);
        }
    }
}
