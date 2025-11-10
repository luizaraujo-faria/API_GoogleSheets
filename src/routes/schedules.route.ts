import express, { Router } from 'express';
import SchedulesController from '../controllers/schedulesController';
import SchedulesService from '../services/schedulesService';

const schedulesController = new SchedulesController(new SchedulesService);
const router = Router();

router.get('/', schedulesController.getAll);
router.post('/', schedulesController.writeData);
// sheetsRouter.patch('/sheets', sheetsController.updateData);

const schedulesRouter = {
    prefix: '/schedules',
    router,
}

export default schedulesRouter;