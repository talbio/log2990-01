import {NextFunction, Request, Response, Router} from 'express';
import {inject, injectable} from 'inversify';
import {Drawing} from '../../../common/communication/Drawing';
import {DrawingsService} from '../services/drawings.service';
import Types from '../types';

@injectable()
export class DrawingsController {

    readonly HTTP_CODE_SUCCESS = 200;
    readonly HTTP_CODE_BAD_REQUEST = 400;
    readonly HTTP_CODE_SERVICE_UNAVAILABLE = 503;

    router: Router;

    constructor(@inject(Types.DrawingsService) private drawingsService: DrawingsService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();

        this.router.post('/', async (req: Request, res: Response, next: NextFunction) => {
            const drawing: Drawing = req.body.data as Drawing;
            await this.drawingsService.postDrawing(drawing) ?
                res.send({httpCode: this.HTTP_CODE_SUCCESS}) :
                res.send({httpCode: this.HTTP_CODE_BAD_REQUEST});
        });

        this.router.get('/', async (req: Request, res: Response, next: NextFunction) => {
            await this.drawingsService.getDrawings()
                .then( (drawings: Drawing[]) => res.send(drawings))
                .catch( () => res.sendStatus(this.HTTP_CODE_SERVICE_UNAVAILABLE));
        });

        this.router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
            await this.drawingsService.deleteDrawing(req.params.id)
                .then( (success: boolean) => success ? res.send(success) : res.sendStatus(this.HTTP_CODE_SERVICE_UNAVAILABLE));
        });
    }
}
