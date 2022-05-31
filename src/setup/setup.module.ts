import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SetupService } from './setup.service';
import { SetupController } from './setup.controller';
import { User } from '../users/models/user.model';
import { IsSetupGuard } from './is-setup.guard';
import { IsSetupHealthIndicator } from './is-setup.health';
import { ObjectionModule } from '@willsoto/nestjs-objection';

@Module({
  imports: [ObjectionModule.forFeature([User])],
  controllers: [SetupController],
  providers: [
    //{
    //  provide: APP_GUARD,
    //  useClass: IsSetupGuard,
    //},
    SetupService,
    IsSetupHealthIndicator,
  ],
  exports: [SetupService, IsSetupHealthIndicator],
})
export class SetupModule {}
