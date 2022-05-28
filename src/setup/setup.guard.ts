import { CanActivate, Injectable } from '@nestjs/common';
import { SetupService } from './setup.service';

@Injectable()
export class SetupGuard implements CanActivate {
  constructor(private setupService: SetupService) {}

  async canActivate(): Promise<boolean> {
    return !(await this.setupService.isSetup());
  }
}
