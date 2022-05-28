import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SetupController } from '../setup/setup.controller';
import { SetupService } from '../setup/setup.service';
import { HealthController } from '../health/health.controller';

@Injectable()
export class IsSetupGuard implements CanActivate {
  constructor(private setupService: SetupService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const controllerClass = context.getClass();
    if (
      controllerClass == SetupController ||
      controllerClass == HealthController
    ) {
      return true;
    }
    return this.setupService.isSetup();
  }
}
