import { Router } from 'express';
import ColaboratorController from '../controllers/colaboratorController';
import ColaboratorService from '../services/colaboratorService';

const colaboratorController = new ColaboratorController(new ColaboratorService);
const router = Router();

router.get('/', colaboratorController.getAll);
router.get('/id/:colaboratorId', colaboratorController.getById);
router.get('/sector/:sector', colaboratorController.listBySector);

const colaboratorRouter = {
    prefix: '/colaborators',
    router,
}

export default colaboratorRouter;