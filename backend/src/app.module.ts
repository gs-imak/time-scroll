import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module'; // 👈 Your custom DB module
import { MapGateway } from './map/map.gateway';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes config accessible everywhere
    }),
    DatabaseModule, // PostgreSQL + TypeORM config
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, MapGateway],
})
export class AppModule {}
