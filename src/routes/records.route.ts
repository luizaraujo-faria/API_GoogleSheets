import express, { Router } from 'express';
import RecordsController from '../controllers/recordsController';

export function recordsRouter(container: any) {
    const recordsController = new RecordsController(container.recordsService);
    const router = Router();

    router.get('/', recordsController.getAll);
    router.get('/filters', recordsController.getAllByFilters);
    router.get('/meal/peaktime', recordsController.groupByPeakTimeByMonth);
    router.get('/meal/sectors', recordsController.listMealCountOfAllSectorsByMonthAndYear);
    router.get('/meal/collaborators', recordsController.listMealCountOfAllCollaboratorsByMonthAndYear);
    router.get('/meal/collaborators/types', recordsController.listMealCountOfAllCollaboratorTypeByMonthAndYear);
    router.post('/', recordsController.sendRecord);

    return {
        prefix: '/records',
        router,
    }
}