import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { SetupModule } from '../setup/setup.module';

@Module({
  imports: [SetupModule, TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
