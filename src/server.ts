import 'dotenv/config';
import { buildContainer } from './config/contianer';
import { createApp } from './app';

async function bootstrap() {
    const container = await buildContainer();
    const app = createApp(container);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Aplicação rodando na porta ${PORT}`);
    });
}

bootstrap();
