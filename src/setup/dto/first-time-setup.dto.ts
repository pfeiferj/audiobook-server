import { IsString, IsByteLength } from 'class-validator';
export class FirstTimeSetupDto {
  @IsString()
  @IsByteLength(1)
  username: string;

  @IsString()
  @IsByteLength(6)
  password: string;
}
