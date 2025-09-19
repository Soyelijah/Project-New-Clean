// apps/backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppDataSource } from './data-source';

async function initializeDatabase(
  attempts = 5,
  delayMs = 2000
): Promise<void> {
  for (let i = 1; i <= attempts; i++) {
    try {
      await AppDataSource.initialize();
      console.log('✅ Database connection OK');
      return;
    } catch (err: any) {
      console.warn(
        `⚠️ DB connection attempt ${i}/${attempts} failed: ${err.message}`
      );
      if (i < attempts) {
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        console.error(
          '❌ Unable to connect to database after maximum retries'
        );
        process.exit(1);
      }
    }
  }
}

async function bootstrap() {
  // 1. Inicializa la BD con reintentos
  await initializeDatabase();

  // 2. Crea la aplicación Nest
  const app = await NestFactory.create(AppModule);

  // 3. Shutdown hooks para contenedores/K8s
  app.enableShutdownHooks();

  // 4. Middlewares globales (opcional)
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true })
  );

  // 5. Arranca el servidor
  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);
  console.log(`🚀 Backend listo en http://localhost:${port}`);
}

bootstrap();
