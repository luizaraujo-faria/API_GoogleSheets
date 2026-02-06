import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { routes } from './routes/index';
import { ZodError } from 'zod';
import 'dotenv/config';

export function createApp(container: any) {
    const app = express();

    // MIDDLEWARES
    app.use(cors()); // LIBERA ACESSO A API
    app.use(express.json()); // FORMATA DADOS RECEBIDOS PARA JSON

    // ROTAS DINAMICAS
    routes(container).forEach(({ prefix, router }) => {
        app.use(`/api${prefix}`, router);
    });

    app.get('/health', (_, res) => {
        res.json({ status: 'OK' });
    })

    // ERROR HANDLING
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
        
        // CAPTURA ERROS DE VALIDAÇÃO DO ZOD
        if(err instanceof ZodError){
            const formatted = err.issues.map(issue => ({
                field: issue.path.join('.'),
                error: issue.message
            }));

            return res.status(400).json({
                sucess: false,
                message: "Dados inválidos",
                fields: formatted
            });
        }

        console.error('Erro:', err.stack || err);

        // CAPTURA ERROS DO SERVIDOR
        return res.status(err.httpStatus || 500).json({
            sucess: false,
            error: 'Algo deu errado!',
            message: err.message
        });
    });

    // 404 HANDLER PARA ROTAS
    // app.use((req: Request, res: Response) => {
    //     res.status(404).json({ 
    //         error: 'Rota não encontrada',
    //         path: req.originalUrl,
    //         method: req.method,
    //         available_endpoints: [
    //             'GET /',
    //             'GET /health', 
    //             'GET /api/sheets/read',
    //             'POST /api/sheets/write',
    //             'PUT /api/sheets/update'
    //         ]
    //     });
    // });

    return app;
}

