import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JobModule } from './job/job.module';
import { ApplicationsModule } from './applications/applications.module';
import { StorageModule } from './storage/storage.module';
import { TenantMiddleware } from './common/middleware/tenant/tenant.middleware';
import { RequestIdMiddleware } from './common/middleware/request-id/request-id.middleware';
import { TenantModule } from './tenant/tenant.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrometheusModule } from './observability/prometheus.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: parseInt(config.get('THROTTLE_TTL', '3600000')), // Default: 1 hour in ms
          limit: parseInt(config.get('THROTTLE_LIMIT', '10')), // Default: 10 requests
        },
      ],
    }),
    PrometheusModule,
    TenantModule,
    JobModule,
    ApplicationsModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply RequestIdMiddleware first to all routes
    consumer.apply(RequestIdMiddleware).forRoutes('*');

    // Apply TenantMiddleware to all routes except public
    consumer
      .apply(TenantMiddleware)
      .exclude({ path: 'public/(.*)', method: RequestMethod.ALL })
      .forRoutes('*');
  }
}
