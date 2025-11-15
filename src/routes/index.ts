import recordsRouter from "./records.route";
import colaboratorRouter from "./colaborator.route";
import { Router } from 'express';

type RouteType = {
    prefix: string;
    router: Router;
}

const routes: RouteType[] = [
    recordsRouter,
    colaboratorRouter,
]

export default routes;