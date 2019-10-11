import {NextFunction, Request, Response, Router} from 'express';
import {inject, injectable} from 'inversify';
import {Drawing} from '../../../common/communication/Drawing';
import {DrawingsStockerService} from '../services/drawings-stocker.service';
import Types from '../types';

@injectable()
export class DrawingsController {

    readonly HTTP_CODE_200 = 200;

    router: Router;

    constructor(@inject(Types.DrawingsStockerService) private drawingsStockerService: DrawingsStockerService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();
        this.router.post('/', (req: Request, res: Response, next: NextFunction) => {
            const drawing: Drawing = req.body.data as Drawing;
            this.drawingsStockerService.storeDrawing(drawing);
            res.send(this.HTTP_CODE_200);
        });
    }
}
