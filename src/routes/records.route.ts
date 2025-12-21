import express, { Router } from 'express';
import RecordsController from '../controllers/recordsController';
import RecordsService from '../services/recordsService';

const recordsController = new RecordsController(new RecordsService);
const router = Router();

router.get('/', recordsController.getAll);
router.get('/sector/:sector', recordsController.listBySector);
router.get('/day/:day', recordsController.listByDay);
router.get('/entry/:turn', recordsController.listEntryByTurn);
router.get('/meal/colaborator/:colaboratorId/:month', recordsController.listMealCountByColaboratorIdByMonth);
router.get('/meal/sector/:sector/:month', recordsController.listMealCountBySectorByMonth);
router.post('/', recordsController.sendRecord);

const recordsRouter = {
    prefix: '/records',
    router,
}

export default recordsRouter;