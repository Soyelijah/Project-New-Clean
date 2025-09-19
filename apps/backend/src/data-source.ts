import { config as loadEnv } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// 1. Carga el .env según NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
loadEnv({ path: envFile });

// 2. Debug: comprueba valores
console.log('--- ENV DEBUG ---');
console.log('NODE_ENV :', process.env.NODE_ENV);
console.log('ENV FILE :', envFile);
console.log('DB_HOST  :', process.env.DB_HOST);
console.log('DB_PORT  :', process.env.DB_PORT);
console.log('DB_NAME  :', process.env.DB_NAME);
console.log('--------------');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  namingStrategy: new SnakeNamingStrategy(),
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: true, ca: process.env.DB_CA }
    : false,
  entities: [
    join(
      __dirname,
      process.env.NODE_ENV === 'production'
        ? '../dist/**/*.entity.js'
        : 'src/**/*.entity.ts'
    )
  ],
  migrations: [
    join(
      __dirname,
      process.env.NODE_ENV === 'production'
        ? '../dist/migrations/*.js'
        : 'src/migrations/*.ts'
    )
  ],
  synchronize: false,
  logging: ['error'],
  extra: {
    max: 50,
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  }
});
