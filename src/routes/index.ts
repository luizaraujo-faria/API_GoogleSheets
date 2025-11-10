import schedulesRouter from "./schedules.route";
import colaboratorRouter from "./colaborator.route";
import { Router } from 'express';

type RouteType = {
    prefix: string;
    router: Router;
}

const routes: RouteType[] = [
    schedulesRouter,
    colaboratorRouter,
]

export default routes;