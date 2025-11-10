import { Router } from 'express';
import ColaboratorController from '../controllers/colaboratorController';
import ColaboratorService from '../services/colaboratorService';

const colaboratorController = new ColaboratorController(new ColaboratorService);
const router = Router();

router.get('/', colaboratorController.getAll);

const colaboratorRouter = {
    prefix: '/colaborators',
    router,
}

export default colaboratorRouter;