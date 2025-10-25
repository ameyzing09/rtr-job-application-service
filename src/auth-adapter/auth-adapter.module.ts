import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthAdapterService } from './auth-adapter.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [AuthAdapterService],
  exports: [AuthAdapterService],
})
export class AuthAdapterModule {}
