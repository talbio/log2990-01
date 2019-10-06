import {NextFunction, Request, Response, Router} from 'express';
import * as fs from 'fs';
import {injectable} from 'inversify';

@injectable()
export class DrawingsController {

    router: Router;

    storeData = (data: string, path: string) => {
        try {
            fs.writeFileSync(path, JSON.stringify(data, null, 2));
        } catch (err) {
            console.error(err);
        }
    }

    loadData = (path: string) => {
        try {
            return fs.readFileSync(path, 'utf8');
        } catch (err) {
            console.error(err)
            return false;
        }
    }

    constructor() {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();
        this.router.post('/', (req: Request, res: Response, next: NextFunction) => {
            const id = '1';
            this.storeData(req.body.data, './drawing_' + id + '.json');
            console.log(JSON.parse(this.loadData('./drawing_1.json') as string));
        });
    }
}
