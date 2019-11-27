import { injectable } from 'inversify';
import { Collection, Db, MongoClient, MongoError } from 'mongodb';

const DB_URL = 'mongodb+srv://admin:admin@team-01-coilt.mongodb.net/test?retryWrites=true&w=majority';

@injectable()
export class MongoDbService {

    private mongo: MongoClient;
    private db: Db;

    async connectDB(): Promise<MongoClient> {
        if (this.mongo) {
            return this.mongo;
        }
        this.mongo = await MongoClient.connect(DB_URL, {useNewUrlParser: true});
        return this.mongo;
    }
}
