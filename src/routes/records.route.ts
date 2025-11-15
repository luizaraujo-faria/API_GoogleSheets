import express, { Router } from 'express';
import RecordsController from '../controllers/recordsController';
import RecordsService from '../services/recordsService';

const recordsController = new RecordsController(new RecordsService);
const router = Router();

router.get('/', recordsController.getAll);
router.get('/sector/:sector', recordsController.listBySector);
router.get('/day/:day', recordsController.listByDay);
router.get('/entry/:turn', recordsController.listEntryByTurn);
router.post('/', recordsController.createRecord);
// sheetsRouter.patch('/sheets', sheetsController.updateData);

const recordsRouter = {
    prefix: '/records',
    router,
}

export default recordsRouter;