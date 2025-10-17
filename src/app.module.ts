import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { JobModule } from './job/job.module';
import { ApplicationsModule } from './applications/applications.module';
import { TenantMiddleware } from './common/middleware/tenant/tenant.middleware';
import { TenantModule } from './tenant/tenant.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TenantModule,
    JobModule,
    ApplicationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude({ path: 'public/(.*)', method: RequestMethod.ALL })
      .forRoutes('*');
  }
}
