import { recordsRouter } from "./records.route";
import { collaboratorRouter } from "./collaborator.route";
import { Router } from 'express';

type RouteType = {
    prefix: string;
    router: Router;
}

export function routes(container: any): RouteType[] {

    return [
        recordsRouter(container),
        collaboratorRouter(container),
    ]
}



export default routes;