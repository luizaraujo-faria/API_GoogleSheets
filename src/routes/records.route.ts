import express, { Router } from 'express';
import RecordsController from '../controllers/recordsController';

export function recordsRouter(container: any) {
    const recordsController = new RecordsController(container.recordsService);
    const router = Router();

    router.get('/', recordsController.getAll);
    router.get('/filters', recordsController.getAllByFilters);
    router.get('/mealtime/sectors/:month', recordsController.listAverageMealTimeBySector);
    router.get('/meal/sectors/:month', recordsController.listMealCountOfAllSectorsByMonth);
    router.get('/meal/collaborators/:month', recordsController.listMealCountOfAllCollaboratorsByMonth);
    router.get('/meal/collaborators/types/:month', recordsController.listMealCountOfAllCollaboratorTypeByMonth);
    router.post('/', recordsController.sendRecord);

    return {
        prefix: '/records',
        router,
    }
}