import {Container} from 'inversify';
import {Application} from './app';
import {DrawingsController} from './controllers/drawings.controller';
import {Server} from './server';
import {DrawingsService} from './services/drawings.service';
import {FirebaseService} from './services/firebase.service';
import {MongoDbService} from './services/mongo-db.service';
import Types from './types';

const container: Container = new Container();

container.bind(Types.Server).to(Server);
container.bind(Types.Application).to(Application);

container.bind(Types.DrawingsController).to(DrawingsController);
container.bind(Types.DrawingsService).to(DrawingsService);

container.bind(Types.MongoDbService).to(MongoDbService);
container.bind(Types.FireBaseService).to(FirebaseService);

export {container};
