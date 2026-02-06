import { Router } from 'express';
import CollaboratorController from '../controllers/collaboratorController';

export function collaboratorRouter(container: any) {

    const collaboratorController = new CollaboratorController(container.collaboratorService);
    const router = Router();

    router.get('/', collaboratorController.getAll);
    router.post('/', collaboratorController.createCollaborator);

    return {
        prefix: '/colaborators',
        router,
    }
}