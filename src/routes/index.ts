import recordsRouter from "./records.route";
import collaboratorRouter from "./collaborator.route";
import { Router } from 'express';

type RouteType = {
    prefix: string;
    router: Router;
}

const routes: RouteType[] = [
    recordsRouter,
    collaboratorRouter,
]

export default routes;