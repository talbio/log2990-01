import {NextFunction, Request, Response, Router} from 'express';
import {inject, injectable} from 'inversify';
import {Drawing} from '../../../common/communication/Drawing';
import {DrawingsStockerService, DrawingWithId} from '../services/drawings-stocker.service';
import Types from '../types';

@injectable()
export class DrawingsController {

    readonly HTTP_CODE_SUCCESS = 200;
    readonly HTTP_CODE_BAD_REQUEST = 400;

    router: Router;

    constructor(@inject(Types.DrawingsStockerService) private drawingsStockerService: DrawingsStockerService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();

        this.router.post('/', (req: Request, res: Response, next: NextFunction) => {
            const drawing: Drawing = req.body.data as Drawing;
            this.drawingsStockerService.storeDrawing(drawing) ?
                res.sendStatus(this.HTTP_CODE_SUCCESS) : res.sendStatus(this.HTTP_CODE_BAD_REQUEST);
        });

        this.router.get('/', async (req: Request, res: Response, next: NextFunction) => {
            const drawings: Drawing[] = [];
            await this.drawingsStockerService.getDrawings().then( (drawingsWithIds: DrawingWithId[]) => {
                drawingsWithIds.forEach( (drawingWithId: DrawingWithId) => drawings.push(drawingWithId.drawing) );
            });
            res.send(drawings);
        });
    }
}
