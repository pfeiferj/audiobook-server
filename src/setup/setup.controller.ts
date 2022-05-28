import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SetupService } from './setup.service';
import { FirstTimeSetupDto } from './dto/first-time-setup.dto';
import { SetupGuard } from './setup.guard';

@Controller({
  path: 'setup',
  version: '1',
})
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Post()
  @UseGuards(SetupGuard)
  firstTime(@Body() firstTimeSetupDto: FirstTimeSetupDto) {
    return this.setupService.firstTime(firstTimeSetupDto);
  }
}
