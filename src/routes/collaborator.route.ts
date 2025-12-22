import { Router } from 'express';
import CollaboratorController from '../controllers/collaboratorController';
import CollaboratorService from '../services/collaboratorService';

const collaboratorController = new CollaboratorController(new CollaboratorService);
const router = Router();

router.get('/', collaboratorController.getAll);
router.get('/id/:colaboratorId', collaboratorController.getById);
router.get('/sector/:sector', collaboratorController.listBySector);
router.post('/', collaboratorController.createCollaborator);

const collaboratorRouter = {
    prefix: '/colaborators',
    router,
}

export default collaboratorRouter;