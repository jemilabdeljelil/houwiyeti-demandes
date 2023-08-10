import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDemandeRepDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  demandeStatus: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  successCode: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  livresonPin: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  NUD: string;

  constructor(demandeStatus: number, successCode: number, livresonPin: string, NUD: string) {
    this.demandeStatus = demandeStatus;
    this.successCode = successCode;
    this.livresonPin = livresonPin;
    this.NUD = NUD;
  }
}
