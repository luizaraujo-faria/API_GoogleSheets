import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import routes from './routes/index.js';
import { ZodError } from 'zod';

dotenv.config();

// Criar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
routes.forEach(({ prefix, router }) =>{
    app.use(`/api${prefix}`, router);
});

// DEBUG PARA VER ROTAS DISPONIVEIS
function printRoutes(stack: any[], prefix: string = ''){

    stack.forEach((middleware) => {
    
        if(middleware.route) {
            // Rota direta
            const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
            const path = prefix + middleware.route.path;
            console.log(`📍 ${methods} ${path}`);
        }
        else if(middleware.name === 'router' && middleware.handle.stack){
            // Router com prefixo
            const newPrefix = prefix + (middleware.regexp.toString() !== '/^\\/?$/i' 
                ? middleware.regexp.toString().replace(/^\/\^\\\//, '').replace(/\\\/\?\/i$/, '')
                : '');
        
            console.log(`📁 Router: ${newPrefix || '/'}`);
            printRoutes(middleware.handle.stack, newPrefix);
        }
    });
};

console.log('=== ROTAS COMPLETAS ===');
printRoutes(app._router.stack);
console.log('=== FIM DAS ROTAS ===');

// Logging para desenvolvimento
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// HEALTH CHECK
app.get('/health', (req: Request, res: Response) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        message: 'API Google Sheets funcionando perfeitamente!'
    });
});

// ROTA PRINCIPAL
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'API Google Sheets funcionando!',
        endpoints: {
        health: 'GET /health',
        read_data: 'GET /api/sheets/read',
        write_data: 'POST /api/sheets/write',
        update_data: 'PUT /api/sheets/update'
        },
        status: 'online'
    });
});

// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    
    // Erros do Zod
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

    return res.status(err.httpStatus || 500).json({
        sucess: false,
        error: 'Algo deu errado!',
        message: err.message
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ 
        error: 'Rota não encontrada',
        path: req.originalUrl,
        method: req.method,
        available_endpoints: [
        'GET /',
        'GET /health', 
        'GET /api/sheets/read',
        'POST /api/sheets/write',
        'PUT /api/sheets/update'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`Aplicação rodando na porta ${PORT}`);
});