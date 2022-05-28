import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, SequelizeHealthIndicator } from '@nestjs/terminus';
import { IsSetupHealthIndicator } from '../setup/is-setup.health';
import { SetupService } from '../setup/setup.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: SequelizeHealthIndicator,
    private isSetupHealthIndicator: IsSetupHealthIndicator,
    private setupService: SetupService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.isSetupHealthIndicator.isHealthy(this.setupService),
    ]);
  }
}
