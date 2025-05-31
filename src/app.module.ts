import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { JobModule } from './job/job.module';
// import { ApplicationsModule } from './applications/applications.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    JobModule,
    /*ApplicationsModule,*/
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
