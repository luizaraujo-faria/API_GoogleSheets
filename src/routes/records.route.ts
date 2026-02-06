import express, { Router } from 'express';
import RecordsController from '../controllers/recordsController';

export function recordsRouter(container: any) {
    const recordsController = new RecordsController(container.recordsService);
    const router = Router();

    router.get('/', recordsController.getAll);
    router.get('/sector/:sector', recordsController.listBySector);
    router.get('/day/:day', recordsController.listByDay);
    router.get('/entry/:turn', recordsController.listEntryByTurn);
    router.get('/meal/collaborator/:collaboratorId/:month', recordsController.listMealCountByColaboratorIdByMonth);
    router.get('/meal/sector/:sector/:month', recordsController.listMealCountBySectorByMonth);
    router.get('/meal/sector/:month', recordsController.listMostMealCountSectorsByMonth);
    router.get('/meal/sectors/:month', recordsController.listMealCountOfAllSectorsByMonth);
    router.get('/meal/collaborators/:month', recordsController.listMealCountOfAllCollaboratorsByMonth);
    router.get('/meal/collaborators/types/:month', recordsController.listMealCountOfAllCollaboratorTypeByMonth);
    router.post('/', recordsController.sendRecord);

    return {
        prefix: '/records',
        router,
    }
}