import { Injectable, Inject } from '@nestjs/common';
import { FirstTimeSetupDto } from './dto/first-time-setup.dto';
import { User } from '../users/models/user.model';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Config } from '../app.module';

@Injectable()
export class SetupService {
  constructor(
    @Inject(User)
    private userModel: typeof User,
    private configService: ConfigService<Config>,
  ) {}

  async firstTime(firstTimeSetupDto: FirstTimeSetupDto) {
    const rounds = this.configService.get('BCRYPT_ROUNDS');
    const hashed = await bcrypt.hash(firstTimeSetupDto.password, rounds);
    const user = await this.userModel.query().insert({
      name: firstTimeSetupDto.username,
      password: hashed,
      isAdmin: true,
    });
    const { password, ...strippedUser } = user;
    return strippedUser;
  }

  async isSetup(): Promise<boolean> {
    global.isSetup === global.isSetup ||
      (await this.userModel.query().count()).length > 0;
    return global.isSetup;
  }
}
