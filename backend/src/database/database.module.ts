// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'yourpassword',
      database: process.env.DB_NAME || 'yourdbname',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true, // ❗ for dev only, disable in production
    }),
  ],
})
export class DatabaseModule {}
