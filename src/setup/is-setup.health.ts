import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { SetupService } from './setup.service';

@Injectable()
export class IsSetupHealthIndicator extends HealthIndicator {
  async isHealthy(setupService: SetupService): Promise<HealthIndicatorResult> {
    const isHealthy = await setupService.isSetup();
    const result = this.getStatus('setup', true, { isSetup: isHealthy });
    return result;
  }
}
