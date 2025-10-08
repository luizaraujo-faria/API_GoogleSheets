import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sheetsRouter from './routes/sheets.route';

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
app.use('/api', sheetsRouter);

// Logging para desenvolvimento
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// HEALTH CHECK - Adicione esta rota
app.get('/health', (req: Request, res: Response) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        message: 'API Google Sheets funcionando perfeitamente!'
    });
});

// ROTA PRINCIPAL - Adicione esta também
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
    console.error('Erro:', err.stack);
    res.status(500).json({ 
        error: 'Algo deu errado!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
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