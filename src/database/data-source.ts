import { Job } from '../job/job.entity';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
// import { Application } from '../applications/applications.entity';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'ameykode',
  database: process.env.DB_NAME || 'recrutr-db',
  entities: [Job/*, Application*/],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
