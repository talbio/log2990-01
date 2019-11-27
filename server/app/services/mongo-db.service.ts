import { injectable } from 'inversify';
import { Collection, Db, MongoClient } from 'mongodb';
import {Drawing} from '../../../common/communication/Drawing';

const DB_URL = 'mongodb+srv://admin:admin@team-01-coilt.mongodb.net/test?retryWrites=true&w=majority';
const DATABASE_NAME = 'polydessin';
const DRAWINGS_COLLECTION = 'drawings';

@injectable()
export class MongoDbService {

    // private mongoClient: MongoClient;
    private db: Db;

    constructor() {
        void this.connectDB();
    }

    async connectDB(): Promise<void> {
        // if (this.mongoClient) {
        //     return this.mongoClient;
        // }
        // await MongoClient.connect(DB_URL, { useUnifiedTopology: true, useNewUrlParser: true }, (error, client) => {
        //     console.log(error);
        //     this.mongoClient = client;
        // });
        // return this.mongoClient;

        const client = new MongoClient(DB_URL, { useUnifiedTopology: true, useNewUrlParser: true });
        await client.connect((err) => {
            const drawingsCollection = client.db(DATABASE_NAME).collection(DRAWINGS_COLLECTION);
            console.log(drawingsCollection);
            client.close();
        });
    }

    async addDrawing(drawing?: Drawing): Promise<void> {
        // this.db = (await this.connectDB()).db(DATABASE_NAME);
        const users: Collection<any> = this.db.collection(DRAWINGS_COLLECTION);
        console.log(users);
    }
}
